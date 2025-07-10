import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  linkedinUrl: text("linkedin_url"),
  phone: text("phone"),
  notes: text("notes"),
  preferredChannel: text("preferred_channel").notNull().default("email"), // "email" | "linkedin"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(), // "follow-up" | "introduction" | "proposal" | "check-in"
  channel: text("channel").notNull(), // "email" | "linkedin" | "both"
  subject: text("subject"),
  content: text("content").notNull(),
  variables: jsonb("variables").default('[]'), // array of variable names
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const followUps = pgTable("follow_ups", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  clientId: integer("client_id").notNull(),
  subject: text("subject").notNull(),
  content: text("content"),
  channel: text("channel").notNull(), // "email" | "linkedin"
  priority: text("priority").notNull().default("medium"), // "low" | "medium" | "high"
  status: text("status").notNull().default("pending"), // "pending" | "sent" | "overdue" | "completed"
  scheduledFor: timestamp("scheduled_for").notNull(),
  sentAt: timestamp("sent_at"),
  context: text("context"), // additional context for AI generation
  templateId: integer("template_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  clientId: integer("client_id").notNull(),
  followUpId: integer("follow_up_id"),
  channel: text("channel").notNull(), // "email" | "linkedin"
  subject: text("subject"),
  content: text("content").notNull(),
  status: text("status").notNull().default("draft"), // "draft" | "sent" | "failed"
  sentAt: timestamp("sent_at"),
  responseReceived: boolean("response_received").default(false),
  responseAt: timestamp("response_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
});

export const insertFollowUpSchema = createInsertSchema(followUps).omit({
  id: true,
  createdAt: true,
  sentAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  sentAt: true,
  responseAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type FollowUp = typeof followUps.$inferSelect;
export type InsertFollowUp = z.infer<typeof insertFollowUpSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
