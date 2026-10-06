import { pgTable, serial, text, varchar, pgEnum, boolean, integer, numeric, timestamp, uniqueIndex, AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations, InferSelectModel } from 'drizzle-orm';

// --- Enums ---
export const userRole = pgEnum('user_role', ['admin', 'internal', 'external']);
export const userStatus = pgEnum('user_status', ['pending', 'approved', 'rejected']);
export const businessTypeEnum = pgEnum('business_type', ['Sole Proprietorship', 'Partnership', 'Limited Liability Company (LLC)', 'Corporation']);
export const businessTaxStatusEnum = pgEnum('business_tax_status', ['S-Corporation', 'C-Corporation', 'Not Applicable']);
export const demographicCategoryEnum = pgEnum('demographic_category', ['Race', 'Gender', 'Religion']);
export const locationCategoryEnum = pgEnum('location_category', ['City', 'Region', 'State']);
export const classTypeEnum = pgEnum('class_type', ['pre-course', 'hth-course']);
export const enrollmentStatusEnum = pgEnum('enrollment_status', ['enrolled', 'completed', 'dropped', 'pending', 'rejected']);
export const businessStageEnum = pgEnum('business_stage', ['Idea', 'Startup', 'Growing', 'Established']);
export const intakeStatusEnum = pgEnum('intake_status', ['submitted', 'reviewed', 'archived']);
export const cohortStatusEnum = pgEnum('cohort_status', ['upcoming', 'open', 'in_progress', 'completed']);
export const supportCategoryEnum = pgEnum('support_category', ['Emergency / Urgent Issue', 'Cash Flow, Payroll or Debt', 'Line of Credit / Loans', 'Grants & Funding', 'Legal', 'Contracts & Procurement', 'Accounting & Taxes', 'Licensing & Permits', 'Landlord, Lease or Property', 'Customer or Vendor Dispute', 'Operations & Staffing', 'Marketing & Branding', 'Other']);
export const supportUrgencyEnum = pgEnum('support_urgency', ['low', 'normal', 'high']);
export const supportStatusEnum = pgEnum('support_status', ['open', 'in_progress', 'resolved', 'closed']);
export const resourceCategoryEnum = pgEnum('resource_category', ['Grants & Opportunities', 'Business Resources', 'Deals & Discounts']);
export const documentKindEnum = pgEnum('document_kind', ['W-9', 'Pitch Deck', 'Business Plan', 'Financials', 'ID / Verification', 'Certification', 'Other']);

// --- Tables ---
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  email: text('email').notNull().unique(),
  password: varchar('password', { length: 256 }).notNull(),
  role: userRole('role').notNull().default('external'),
  status: userStatus('status').notNull().default('pending'),
  hasBusinessProfile: boolean('has_business_profile').notNull().default(false),
  personalAddress: text('personal_address'),
  personalCity: text('personal_city'),
  personalState: varchar('personal_state', { length: 2 }),
  personalZipCode: varchar('personal_zip_code', { length: 10 }),
  profilePhotoUrl: text('profile_photo_url'),
  businessName: text('business_name'), // Optional business name for account requests
  pitchEventIds: integer('pitch_event_ids').array(), // Pitch competitions they took part in (asked at account request)
  pitchEventOther: text('pitch_event_other'), // Free text when their competition isn't in the list
  isCisgender: boolean('is_cisgender').notNull().default(false),
  isTransgender: boolean('is_transgender').notNull().default(false),
  isOptedOut: boolean('is_opted_out').notNull().default(false),
  canApproveRequests: boolean('can_approve_requests').notNull().default(false), // New permission for approving requests
  canMessageAdmins: boolean('can_message_admins').notNull().default(false), // New permission for messaging admins
  canManageClasses: boolean('can_manage_classes').notNull().default(false), // New permission for managing classes
  canManageBusinesses: boolean('can_manage_businesses').notNull().default(false), // New permission for managing businesses
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
  locationId: integer('location_id').references(() => locations.id), // Keep for backward compatibility or if still used for a primary location
  stateLocationId: integer('state_location_id').references(() => locations.id),
  regionLocationId: integer('region_location_id').references(() => locations.id),
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
  isPublished: boolean('is_published').notNull().default(false), // hidden from members until published
  coverImageUrl: text('cover_image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  classId: integer('class_id').notNull().references(() => classes.id),
  title: text('title').notNull(),
  summary: text('summary'), // one or two lines shown in the lesson list
  content: text('content'), // Markdown
  videoUrl: text('video_url'), // YouTube/Vimeo/Loom link embedded at the top of the lesson
  durationMinutes: integer('duration_minutes'),
  isPublished: boolean('is_published').notNull().default(true),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const enrollments = pgTable('enrollments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  classId: integer('class_id').notNull().references(() => classes.id),
  cohortId: integer('cohort_id').references(() => cohorts.id), // which cohort run they're in
  status: enrollmentStatusEnum('status').notNull().default('pending'),
  enrollmentDate: timestamp('enrollment_date', { withTimezone: true }).notNull().defaultNow(),
});

// Which lessons a member has completed.
export const lessonProgress = pgTable('lesson_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  lessonId: integer('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex('lesson_progress_user_lesson_idx').on(t.userId, t.lessonId)]);

export const businessToCompetition = pgTable('business_to_competition', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id').notNull().references(() => businesses.id),
  competitionEventId: integer('competition_event_id').notNull().references(() => pitchCompetitionEvents.id),
  status: text('status').default('assigned'), // e.g., 'assigned', 'participating', 'winner'
});

// --- HTH curriculum cohorts + waitlist ---
export const cohorts = pgTable('cohorts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // e.g. "January 2027 Cohort"
  description: text('description'),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  status: cohortStatusEnum('status').notNull().default('upcoming'),
  isWaitlistOpen: boolean('is_waitlist_open').notNull().default(true),
  createdById: integer('created_by_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const cohortWaitlist = pgTable('cohort_waitlist', {
  id: serial('id').primaryKey(),
  cohortId: integer('cohort_id').notNull().references(() => cohorts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id), // set when a signed-in member joins
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: varchar('phone', { length: 20 }),
  businessName: text('business_name'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex('cohort_waitlist_cohort_email_idx').on(t.cohortId, t.email)]);

// --- Specialized support requests (tickets) ---
export const supportRequests = pgTable('support_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  businessId: integer('business_id').references(() => businesses.id),
  category: supportCategoryEnum('category').notNull(),
  subject: text('subject').notNull(),
  details: text('details').notNull(),
  amountNeeded: text('amount_needed'), // free text, e.g. "$50,000"
  neededBy: timestamp('needed_by', { withTimezone: true }),
  urgency: supportUrgencyEnum('urgency').notNull().default('normal'),
  status: supportStatusEnum('status').notNull().default('open'),
  adminNotes: text('admin_notes'),
  assignedToId: integer('assigned_to_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// --- Resources hub (grants, business resources, provider deals) ---
export const resources = pgTable('resources', {
  id: serial('id').primaryKey(),
  category: resourceCategoryEnum('category').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  url: text('url'), // external link (application page, provider site, etc.)
  provider: text('provider'), // who offers it, e.g. "SBA", "QuickBooks"
  deadline: timestamp('deadline', { withTimezone: true }), // grants/opportunities
  discountCode: text('discount_code'), // deals
  amount: text('amount'), // e.g. "$5,000 – $25,000" or "30% off"
  tags: text('tags').array(),
  isPublished: boolean('is_published').notNull().default(true),
  isFeatured: boolean('is_featured').notNull().default(false),
  notifiedAt: timestamp('notified_at', { withTimezone: true }), // when members were emailed about it
  createdById: integer('created_by_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// --- Secure documents (private blob storage; served only through an authenticated route) ---
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  ownerId: integer('owner_id').notNull().references(() => users.id),
  businessId: integer('business_id').references(() => businesses.id),
  kind: documentKindEnum('kind').notNull(),
  title: text('title').notNull(),
  fileName: text('file_name').notNull(),
  contentType: text('content_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  blobPathname: text('blob_pathname').notNull(), // private blob key; never exposed to the client
  notes: text('notes'),
  uploadedById: integer('uploaded_by_id').notNull().references(() => users.id), // member or admin on their behalf
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const clientIntakeForms = pgTable('client_intake_forms', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  businessStage: businessStageEnum('business_stage').notNull(),
  businessDescription: text('business_description').notNull(),
  servicesNeeded: text('services_needed').array(),
  currentRevenue: varchar('current_revenue', { length: 50 }),
  numberOfEmployees: varchar('number_of_employees', { length: 50 }),
  primaryGoals: text('primary_goals').notNull(),
  biggestChallenges: text('biggest_challenges').notNull(),
  howDidYouHear: text('how_did_you_hear'),
  // Pitch competition events the client says they pitched at (multi-select, optional)
  pitchEventIds: integer('pitch_event_ids').array(),
  additionalNotes: text('additional_notes'),
  status: intakeStatusEnum('status').notNull().default('submitted'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
});

// --- Types for InferSelectModel ---
export type Demographic = InferSelectModel<typeof demographics>;
export type Location = InferSelectModel<typeof locations>;
export type User = InferSelectModel<typeof users>;
export type Business = InferSelectModel<typeof businesses>;
export type BusinessWithDemographic = InferSelectModel<typeof businesses> & { demographic: Demographic | null };
export type BusinessWithLocation = InferSelectModel<typeof businesses> & { location: Location | null, stateLocation: Location | null, regionLocation: Location | null };
export type BusinessWithDemographicAndLocation = InferSelectModel<typeof businesses> & { demographic: Demographic | null, location: Location | null };
export type MassMessage = InferSelectModel<typeof massMessages>;
export type IndividualMessage = InferSelectModel<typeof individualMessages>;
export type PitchCompetitionEvent = InferSelectModel<typeof pitchCompetitionEvents>;
export type PitchSubmission = InferSelectModel<typeof pitchSubmissions>;
export type BusinessToCompetition = InferSelectModel<typeof businessToCompetition>;
export type ClientIntakeForm = InferSelectModel<typeof clientIntakeForms>;
export type Cohort = InferSelectModel<typeof cohorts>;
export type Lesson = InferSelectModel<typeof lessons>;
export type Class = InferSelectModel<typeof classes>;
export type Enrollment = InferSelectModel<typeof enrollments>;
export type LessonProgress = InferSelectModel<typeof lessonProgress>;
export type SupportRequest = InferSelectModel<typeof supportRequests>;
export type Resource = InferSelectModel<typeof resources>;
export type SecureDocument = InferSelectModel<typeof documents>;
export type CohortWaitlistEntry = InferSelectModel<typeof cohortWaitlist>;


// --- Relations ---
export const usersRelations = relations(users, ({ many }) => ({
  businesses: many(businesses),
  sentMessages: many(individualMessages, { relationName: 'sent_messages' }),
  receivedMessages: many(individualMessages, { relationName: 'received_messages' }),
  enrollments: many(enrollments),
  createdPitchCompetitionEvents: many(pitchCompetitionEvents),
  pitchSubmissions: many(pitchSubmissions),
  intakeForms: many(clientIntakeForms),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  user: one(users, {
    fields: [businesses.userId],
    references: [users.id],
  }),
  location: one(locations, {
    fields: [businesses.locationId],
    references: [locations.id],
  }),
  stateLocation: one(locations, {
    fields: [businesses.stateLocationId],
    references: [locations.id],
  }),
  regionLocation: one(locations, {
    fields: [businesses.regionLocationId],
    references: [locations.id],
  }),
  businessToCompetitions: many(businessToCompetition),
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
  businessToCompetitions: many(businessToCompetition),
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
  cohort: one(cohorts, {
    fields: [enrollments.cohortId],
    references: [cohorts.id],
  }),
}));

export const businessToCompetitionRelations = relations(businessToCompetition, ({ one }) => ({
  business: one(businesses, {
    fields: [businessToCompetition.businessId],
    references: [businesses.id],
  }),
  competitionEvent: one(pitchCompetitionEvents, {
    fields: [businessToCompetition.competitionEventId],
    references: [pitchCompetitionEvents.id],
  }),
}));

export const clientIntakeFormsRelations = relations(clientIntakeForms, ({ one }) => ({
  user: one(users, {
    fields: [clientIntakeForms.userId],
    references: [users.id],
  }),
}));

export const cohortsRelations = relations(cohorts, ({ one, many }) => ({
  createdBy: one(users, { fields: [cohorts.createdById], references: [users.id] }),
  waitlist: many(cohortWaitlist),
}));

export const cohortWaitlistRelations = relations(cohortWaitlist, ({ one }) => ({
  cohort: one(cohorts, { fields: [cohortWaitlist.cohortId], references: [cohorts.id] }),
  user: one(users, { fields: [cohortWaitlist.userId], references: [users.id] }),
}));

export const supportRequestsRelations = relations(supportRequests, ({ one }) => ({
  user: one(users, { fields: [supportRequests.userId], references: [users.id], relationName: 'support_requester' }),
  business: one(businesses, { fields: [supportRequests.businessId], references: [businesses.id] }),
  assignedTo: one(users, { fields: [supportRequests.assignedToId], references: [users.id], relationName: 'support_assignee' }),
}));

export const resourcesRelations = relations(resources, ({ one }) => ({
  createdBy: one(users, { fields: [resources.createdById], references: [users.id] }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  owner: one(users, { fields: [documents.ownerId], references: [users.id], relationName: 'document_owner' }),
  business: one(businesses, { fields: [documents.businessId], references: [businesses.id] }),
  uploadedBy: one(users, { fields: [documents.uploadedById], references: [users.id], relationName: 'document_uploader' }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(users, { fields: [lessonProgress.userId], references: [users.id] }),
  lesson: one(lessons, { fields: [lessonProgress.lessonId], references: [lessons.id] }),
}));
