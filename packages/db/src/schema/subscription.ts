import { pgEnum, pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "past_due",
  "canceled",
  "trialing",
  "unpaid",
]);

export const subscription = pgTable(
  "subscription",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: subscriptionStatusEnum("status").notNull(),
    planId: text("plan_id").notNull(),
    currentPeriodEnd: timestamp("current_period_end").notNull(),
    trialEndsAt: timestamp("trial_ends_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("subscription_userId_idx").on(table.userId)],
);
