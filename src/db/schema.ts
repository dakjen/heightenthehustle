import { pgTable, serial, text, varchar, pgEnum, boolean, integer, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userRole = pgEnum('user_role', ['admin', 'internal', 'external']);

// New enums for business profile
export const businessTypeEnum = pgEnum('business_type', ['Sole Proprietorship', 'Partnership', 'Limited Liability Company (LLC)', 'Corporation']);
export const businessTaxStatusEnum = pgEnum('business_tax_status', ['S-Corporation', 'C-Corporation', 'Not Applicable']);


export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  email: text('email').notNull().unique(),
  password: varchar('password', { length: 256 }).notNull(),
  role: userRole('role').notNull().default('internal'),
  hasBusinessProfile: boolean('has_business_profile').notNull().default(false),
  personalAddress: text('personal_address'), // New field
  personalCity: text('personal_city'), // New field
  personalState: varchar('personal_state', { length: 2 }), // New field
  personalZipCode: varchar('personal_zip_code', { length: 10 }), // New field
  profilePhotoUrl: text('profile_photo_url'), // New field
});

export const businesses = pgTable('businesses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  businessName: text('business_name').notNull(),
  ownerName: text('owner_name').notNull(),
  percentOwnership: numeric('percent_ownership').notNull(),
  businessType: businessTypeEnum('business_type').notNull(),
  businessTaxStatus: businessTaxStatusEnum('business_tax_status').notNull(),
  businessDescription: text('business_description'),
  businessIndustry: text('business_industry').notNull(),
  naicsCode: varchar('naics_code', { length: 6 }), // New field
  logoUrl: text('logo_url'), // New field
  businessMaterialsUrl: text('business_materials_url'),
  streetAddress: text('street_address'), // New field
  city: text('city'), // New field
  state: varchar('state', { length: 2 }), // New field
  zipCode: varchar('zip_code', { length: 10 }), // New field
  phone: varchar('phone', { length: 20 }),
  website: text('website'),
  isArchived: boolean('is_archived').notNull().default(false), // New field
});

export const usersRelations = relations(users, ({ one, many }) => ({
  businesses: many(businesses),
}));

export const businessesRelations = relations(businesses, ({ one }) => ({
  user: one(users, {
    fields: [businesses.userId],
    references: [users.id],
  }),
}));