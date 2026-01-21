import { relations } from "drizzle-orm";
import { user, session, account } from "./auth";
import { subscription } from "./subscription";
import { qrCode, scanEvent } from "./qr";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  subscriptions: many(subscription),
  qrCodes: many(qrCode),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  user: one(user, {
    fields: [subscription.userId],
    references: [user.id],
  }),
}));

export const qrCodeRelations = relations(qrCode, ({ one, many }) => ({
  user: one(user, {
    fields: [qrCode.userId],
    references: [user.id],
  }),
  scans: many(scanEvent),
}));

export const scanEventRelations = relations(scanEvent, ({ one }) => ({
  qrCode: one(qrCode, {
    fields: [scanEvent.qrCodeId],
    references: [qrCode.id],
  }),
}));
