import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
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
