import { db } from "@dynamic-qr/db";
import { qrCode } from "@dynamic-qr/db/schema/qr";
import { eq, and, desc } from "drizzle-orm";
import z from "zod";
import { protectedProcedure } from "../index";
import { ORPCError } from "@orpc/server";

// Simple custom alphanumeric generator
function generateShortCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export const qrRouter = {
  list: protectedProcedure.handler(async ({ context }) => {
    return await db.query.qrCode.findMany({
      where: eq(qrCode.userId, context.session.user.id),
      orderBy: desc(qrCode.createdAt),
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        destinationUrl: z.string().url(),
        title: z.string().optional(),
        designConfig: z.object({
            color: z.string().default("#000000"),
            shape: z.string().default("square"),
            logo: z.string().optional()
        }).optional()
      })
    )
    .handler(async ({ input, context }) => {
       // Loop to ensure unique code (simple implementation)
       let shortCodeStr = generateShortCode();
       let exists = await db.query.qrCode.findFirst({ where: eq(qrCode.shortCode, shortCodeStr) });
       let retries = 0;
       while(exists && retries < 5) {
           shortCodeStr = generateShortCode();
           exists = await db.query.qrCode.findFirst({ where: eq(qrCode.shortCode, shortCodeStr) });
           retries++;
       }
       if (exists) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to generate unique code" });

       const [newQr] = await db.insert(qrCode).values({
         id: crypto.randomUUID(), // Manual ID generation if not default uuid gen in DB, assuming text primary key
         userId: context.session.user.id,
         shortCode: shortCodeStr,
         destinationUrl: input.destinationUrl,
         title: input.title || input.destinationUrl,
         designConfig: input.designConfig
       }).returning();
       
       return newQr;
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
       const qr = await db.query.qrCode.findFirst({
         where: and(
           eq(qrCode.id, input.id),
           eq(qrCode.userId, context.session.user.id)
         )
       });
       if (!qr) throw new ORPCError("NOT_FOUND", { message: "QR Code not found" });
       return qr;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        destinationUrl: z.string().url().optional(),
        title: z.string().optional(),
        designConfig: z.object({
            color: z.string(),
            shape: z.string(),
            logo: z.string().optional()
        }).optional(),
        isActive: z.boolean().optional()
      })
    )
    .handler(async ({ input, context }) => {
        const current = await db.query.qrCode.findFirst({
            where: and(eq(qrCode.id, input.id), eq(qrCode.userId, context.session.user.id))
        });
        if (!current) throw new ORPCError("NOT_FOUND");

        const [updated] = await db.update(qrCode)
          .set({
             ...(input.destinationUrl && { destinationUrl: input.destinationUrl }),
             ...(input.title && { title: input.title }),
             ...(input.designConfig && { designConfig: input.designConfig }),
             ...(input.isActive !== undefined && { isActive: input.isActive }),
             updatedAt: new Date()
          })
          .where(eq(qrCode.id, input.id))
          .returning();
        return updated;
    }),
    
    delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
        const current = await db.query.qrCode.findFirst({
            where: and(eq(qrCode.id, input.id), eq(qrCode.userId, context.session.user.id))
        });
        if (!current) throw new ORPCError("NOT_FOUND");
        
        await db.delete(qrCode).where(eq(qrCode.id, input.id));
        return { success: true };
    })
};
