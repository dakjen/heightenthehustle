import { pgTable, serial, text, varchar, pgEnum, boolean, integer, numeric, timestamp, AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations, InferSelectModel } from 'drizzle-orm';

// --- Enums ---
export const userRole = pgEnum('user_role', ['admin', 'internal', 'external']);
export const businessTypeEnum = pgEnum('business_type', ['Sole Proprietorship', 'Partnership', 'Limited Liability Company (LLC)', 'Corporation']);
export const businessTaxStatusEnum = pgEnum('business_tax_status', ['S-Corporation', 'C-Corporation', 'Not Applicable']);
export const demographicCategoryEnum = pgEnum('demographic_category', ['Race', 'Gender', 'Religion']);
export const locationCategoryEnum = pgEnum('location_category', ['City', 'Region']);
export const classTypeEnum = pgEnum('class_type', ['pre-course', 'hth-course']);
export const enrollmentStatusEnum = pgEnum('enrollment_status', ['enrolled', 'completed', 'dropped', 'pending', 'rejected']);

// --- Tables ---
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  email: text('email').notNull().unique(),
  password: varchar('password', { length: 256 }).notNull(),
  role: userRole('role').notNull().default('internal'),
  hasBusinessProfile: boolean('has_business_profile').notNull().default(false),
  personalAddress: text('personal_address'),
  personalCity: text('personal_city'),
  personalState: varchar('personal_state', { length: 2 }),
  personalZipCode: varchar('personal_zip_code', { length: 10 }),
  profilePhotoUrl: text('profile_photo_url'),
  isOptedOut: boolean('is_opted_out').notNull().default(false),
});

export const demographics = pgTable('demographics', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  category: demographicCategoryEnum('category').notNull(),
});

export const locations = pgTable('locations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  category: locationCategoryEnum('category').notNull().default('City'),
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
  naicsCode: varchar('naics_code', { length: 6 }),
  logoUrl: text('logo_url'),
  businessProfilePhotoUrl: text('business_profile_photo_url'),
  businessMaterialsUrl: text('business_materials_url'),
  streetAddress: text('street_address'),
  city: text('city'),
  state: varchar('state', { length: 2 }),
  zipCode: varchar('zip_code', { length: 10 }),
  phone: varchar('phone', { length: 20 }),
  website: text('website'),
  isArchived: boolean('is_archived').notNull().default(false),
  locationId: integer('location_id').references(() => locations.id),
  demographicIds: integer('demographic_ids').array(),
  material1Url: text('material1_url'),
  material1Title: text('material1_title'),
  material2Url: text('material2_url'),
  material2Title: text('material2_title'),
  material3Url: text('material3_url'),
  material3Title: text('material3_title'),
  material4Url: text('material4_url'),
  material4Title: text('material4_title'),
  material5Url: text('material5_url'),
  material5Title: text('material5_title'),
});

export const massMessages = pgTable('mass_messages', {
  id: serial('id').primaryKey(),
  adminId: integer('admin_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  targetLocationIds: integer('target_location_ids').array(),
  targetDemographicIds: integer('target_demographic_ids').array(),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
});

export const individualMessages = pgTable('individual_messages', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').notNull().references(() => users.id),
  recipientId: integer('recipient_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  read: boolean('read').notNull().default(false),
  replyToMessageId: integer('reply_to_message_id').references((): AnyPgColumn => individualMessages.id),
});

export const pitchCompetitionEvents = pgTable('pitch_competition_events', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  createdById: integer('created_by_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const pitchSubmissions = pgTable('pitch_submissions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  competitionEventId: integer('competition_event_id').notNull().references(() => pitchCompetitionEvents.id),
  projectName: text('project_name').notNull(),
  projectLocation: text('project_location').notNull(),
  pitchVideoUrl: text('pitch_video_url'),
  pitchDeckUrl: text('pitch_deck_url'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
});

export const classes = pgTable('classes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  teacherId: integer('teacher_id').notNull().references(() => users.id),
  type: classTypeEnum('type').notNull().default('hth-course'),
  syllabusUrl: text('syllabus_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  classId: integer('class_id').notNull().references(() => classes.id),
  title: text('title').notNull(),
  content: text('content'),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const enrollments = pgTable('enrollments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  classId: integer('class_id').notNull().references(() => classes.id),
  status: enrollmentStatusEnum('status').notNull().default('pending'),
  enrollmentDate: timestamp('enrollment_date', { withTimezone: true }).notNull().defaultNow(),
});

// --- Types for InferSelectModel ---
export type Demographic = InferSelectModel<typeof demographics>;
export type Location = InferSelectModel<typeof locations>;
export type Business = InferSelectModel<typeof businesses>;
export type BusinessWithDemographic = InferSelectModel<typeof businesses> & { demographic: Demographic | null };
export type BusinessWithLocation = InferSelectModel<typeof businesses> & { location: Location | null };
export type BusinessWithDemographicAndLocation = InferSelectModel<typeof businesses> & { demographic: Demographic | null, location: Location | null };
export type MassMessage = InferSelectModel<typeof massMessages>;
export type IndividualMessage = InferSelectModel<typeof individualMessages>;
export type PitchCompetitionEvent = InferSelectModel<typeof pitchCompetitionEvents>;
export type PitchSubmission = InferSelectModel<typeof pitchSubmissions>;


// --- Relations ---
export const usersRelations = relations(users, ({ one, many }) => ({
  businesses: many(businesses),
  sentMessages: many(individualMessages, { relationName: 'sent_messages' }),
  receivedMessages: many(individualMessages, { relationName: 'received_messages' }),
  enrollments: many(enrollments),
  createdPitchCompetitionEvents: many(pitchCompetitionEvents),
  pitchSubmissions: many(pitchSubmissions),
}));

export const businessesRelations = relations(businesses, ({ one }) => ({
  user: one(users, {
    fields: [businesses.userId],
    references: [users.id],
  }),
  location: one(locations, {
    fields: [businesses.locationId],
    references: [locations.id],
  }),
}));

export const massMessagesRelations = relations(massMessages, ({ one }) => ({
  admin: one(users, {
    fields: [massMessages.adminId],
    references: [users.id],
  }),
}));

export const individualMessagesRelations = relations(individualMessages, ({ one }) => ({
  sender: one(users, {
    fields: [individualMessages.senderId],
    references: [users.id],
    relationName: 'sent_messages',
  }),
  recipient: one(users, {
    fields: [individualMessages.recipientId],
    references: [users.id],
    relationName: 'received_messages',
  }),
  replyToMessage: one(individualMessages, {
    fields: [individualMessages.replyToMessageId],
    references: [individualMessages.id],
  }),
}));

export const pitchCompetitionEventsRelations = relations(pitchCompetitionEvents, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [pitchCompetitionEvents.createdById],
    references: [users.id],
  }),
  submissions: many(pitchSubmissions),
}));

export const pitchSubmissionsRelations = relations(pitchSubmissions, ({ one }) => ({
  user: one(users, {
    fields: [pitchSubmissions.userId],
    references: [users.id],
  }),
  competitionEvent: one(pitchCompetitionEvents, {
    fields: [pitchSubmissions.competitionEventId],
    references: [pitchCompetitionEvents.id],
  }),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
  lessons: many(lessons),
  enrollments: many(enrollments),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  class: one(classes, {
    fields: [lessons.classId],
    references: [classes.id],
  }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [enrollments.classId],
    references: [classes.id],
  }),
}));