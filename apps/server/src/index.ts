import { createContext } from "@dynamic-qr/api/context";
import { appRouter } from "@dynamic-qr/api/routers/index";
import { auth } from "@dynamic-qr/auth";
import { env } from "@dynamic-qr/env/server";
import { cors } from "@elysiajs/cors";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Elysia } from "elysia";
import { db } from "@dynamic-qr/db";
import { qrCode, scanEvent } from "@dynamic-qr/db/schema/qr";
import { eq } from "drizzle-orm";

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});
const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

const app = new Elysia()
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .all("/api/auth/*", async (context) => {
    const { request, status } = context;
    if (["POST", "GET"].includes(request.method)) {
      return auth.handler(request);
    }
    return status(405);
  })
  .all("/rpc*", async (context) => {
    const { response } = await rpcHandler.handle(context.request, {
      prefix: "/rpc",
      context: await createContext({ context }),
    });
    return response ?? new Response("Not Found", { status: 404 });
  })
  .all("/api*", async (context) => {
    const { response } = await apiHandler.handle(context.request, {
      prefix: "/api-reference",
      context: await createContext({ context }),
    });
    return response ?? new Response("Not Found", { status: 404 });
  })
  .get("/:shortCode", async ({ params, set, request }) => {
     const code = params.shortCode;
     // simple filter to avoid assets/favicons
     if (code.includes(".") || code === "favicon.ico") return set.status = 404;

     const qr = await db.query.qrCode.findFirst({
        where: eq(qrCode.shortCode, code)
     });

     if (qr && qr.isActive) {
        // Async analytics logging
        const userAgent = request.headers.get("user-agent");
        const ip = request.headers.get("x-forwarded-for") || "unknown"; // naive
        
        // We do not await this to keep redirect fast. 
        // In production, push to a queue (BullMQ/Redis).
        db.insert(scanEvent).values({
             id: crypto.randomUUID(),
             qrCodeId: qr.id,
             userAgent: userAgent,
             ipAddress: ip,
             timestamp: new Date(),
             deviceType: userAgent?.toLowerCase().includes("mobile") ? "Mobile" : "Desktop",
             os: userAgent?.toLowerCase().includes("mac") ? "MacOS" : userAgent?.toLowerCase().includes("windows") ? "Windows" : "Other"
        }).then(() => console.log(`Logged scan for ${code}`)).catch(e => console.error("Analytics Error", e));

        return Response.redirect(qr.destinationUrl);
     }
     
     set.status = 404;
     return "QR Code not found";
  })
  .get("/", () => "OK")
  .listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
