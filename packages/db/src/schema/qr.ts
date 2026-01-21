import { pgTable, text, timestamp, jsonb, index, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const qrCode = pgTable(
  "qr_code",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    shortCode: text("short_code").notNull().unique(),
    destinationUrl: text("destination_url").notNull(),
    title: text("title"),
    designConfig: jsonb("design_config")
      .$type<{ color: string; shape: string; logo?: string }>()
      .default({ color: "#000000", shape: "square" }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
      index("qr_code_shortCode_idx").on(table.shortCode), 
      index("qr_code_userId_idx").on(table.userId)
    ],
);

export const scanEvent = pgTable(
  "scan_event",
  {
    id: text("id").primaryKey(),
    qrCodeId: text("qr_code_id")
      .notNull()
      .references(() => qrCode.id, { onDelete: "cascade" }),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    ipAddress: text("ip_address"), // hashed for privacy
    userAgent: text("user_agent"),
    country: text("country"),
    city: text("city"),
    deviceType: text("device_type"),
    os: text("os"),
    referrer: text("referrer"),
  },
  (table) => [
    index("scan_event_qrCodeId_idx").on(table.qrCodeId),
    index("scan_event_timestamp_idx").on(table.timestamp),
  ],
);
