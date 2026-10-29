import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const analyticsEvents=sqliteTable('analytics_events',{
 id:text('id').primaryKey(),kind:text('kind').notNull(),day:text('day').notNull(),sessionKey:text('session_key').notNull(),createdAt:integer('created_at').notNull(),
},t=>[index('analytics_events_day').on(t.day)]);
export const customerAccounts = sqliteTable('customer_accounts', {
 id:text('id').primaryKey(), email:text('email').notNull().unique(), name:text('name').notNull(), passwordHash:text('password_hash').notNull(), createdAt:text('created_at').notNull(),
});
export const customerSessions = sqliteTable('customer_sessions', {
 tokenHash:text('token_hash').primaryKey(), userId:text('user_id').notNull().references(()=>customerAccounts.id), expiresAt:integer('expires_at').notNull(),
},table=>[index('customer_sessions_expiry').on(table.expiresAt)]);
export const adminSessions = sqliteTable('admin_sessions', {
  tokenHash: text('token_hash').primaryKey(), email: text('email').notNull(),
  credentialVersion: text('credential_version').notNull(), expiresAt: integer('expires_at').notNull(),
}, table => [index('admin_sessions_expiry').on(table.expiresAt)]);
export const loginAttempts = sqliteTable('login_attempts', {
  key: text('key').primaryKey(), attempts: integer('attempts').notNull(), expiresAt: integer('expires_at').notNull(),
}, table => [index('login_attempts_expiry').on(table.expiresAt)]);
export const products = sqliteTable('products', {
  id: text('id').primaryKey(), name: text('name').notNull(), category: text('category').notNull(),
  description: text('description').notNull(), price: integer('price').notNull(),
  stock: integer('stock').notNull().default(0), image: text('image').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
});
export const profiles = sqliteTable('profiles', {
  userId: text('user_id').primaryKey(), name: text('name').notNull(), email: text('email').notNull(),
  phone: text('phone').notNull().default(''), updatedAt: text('updated_at').notNull(),
});
export const interests = sqliteTable('interests', {
  userId: text('user_id').primaryKey(), name: text('name').notNull(), email: text('email').notNull(),
  createdAt: text('created_at').notNull(),
});
