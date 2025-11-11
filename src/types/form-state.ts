// types/form-state.ts
// This file defines a shared FormState type for use across client components and server actions.

export type FormState = {
  message: string;
  error?: string;
};