// Shared FormState type for client components and server actions.

export type FormState = {
  message: string;
  error?: string;
  /** Per-field validation messages, keyed by input name. */
  fieldErrors?: Record<string, string>;
  /** Optional business name for display purposes. */
  businessName?: string;
  /** Set by createBusinessProfile so the client can navigate to the new business. */
  businessId?: number;
};
