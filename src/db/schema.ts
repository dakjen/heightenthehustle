import { pgTable, serial, text, varchar, pgEnum } from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['admin', 'internal', 'external']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  email: text('email').notNull().unique(),
  password: varchar('password', { length: 256 }).notNull(),
  role: userRole('role').notNull().default('admin'),
});