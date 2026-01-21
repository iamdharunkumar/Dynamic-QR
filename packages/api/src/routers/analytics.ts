import { db } from "@dynamic-qr/db";
import { scanEvent, qrCode } from "@dynamic-qr/db/schema/qr";
import { eq, and, desc, sql, count } from "drizzle-orm";
import z from "zod";
import { protectedProcedure } from "../index";
import { ORPCError } from "@orpc/server";

export const analyticsRouter = {
  getStats: protectedProcedure
    .input(z.object({ qrId: z.string() }))
    .handler(async ({ input, context }) => {
         // Verify ownership
         const qr = await db.query.qrCode.findFirst({ 
             where: and(
                 eq(qrCode.id, input.qrId), 
                 eq(qrCode.userId, context.session.user.id)
             ) 
         });
         
         if (!qr) throw new ORPCError("NOT_FOUND", { message: "QR Code not found" });

         // Total Scans
         const [scansResult] = await db.select({
             count: count()
         }).from(scanEvent).where(eq(scanEvent.qrCodeId, input.qrId));

         // Recent Events
         const recentEvents = await db.select()
            .from(scanEvent)
            .where(eq(scanEvent.qrCodeId, input.qrId))
            .orderBy(desc(scanEvent.timestamp))
            .limit(20);

         // Group by City
         // Note: Drizzle group by support varies by driver, assuming standard PG
         const byCity = await db.select({
             name: scanEvent.city,
             value: count()
         })
         .from(scanEvent)
         .where(eq(scanEvent.qrCodeId, input.qrId))
         .groupBy(scanEvent.city)
         .limit(5);

         // Group by Device
         const byDevice = await db.select({
             name: scanEvent.deviceType,
             value: count()
         })
         .from(scanEvent)
         .where(eq(scanEvent.qrCodeId, input.qrId))
         .groupBy(scanEvent.deviceType)
         .limit(5);

         return {
             totalScans: scansResult.count,
             recentEvents,
             byCity: byCity.filter(c => c.name), // Filter nulls
             byDevice: byDevice.filter(d => d.name)
         };
    })
};
