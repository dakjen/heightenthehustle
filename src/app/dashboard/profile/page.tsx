"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { FormState } from "@/types/form-state";
import { updateProfile } from "./actions";
import { getSession } from "@/app/login/actions";
import Image from "next/image";
import {
  Field, FormSection, SubmitButton, FormError, FormSuccess, RequiredNote,
  inputClass, fileInputClass,
} from "@/app/components/form";

// Define a type for the user object in state, matching the updated schema
interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  personalAddress: string | null;
  personalCity: string | null;
  personalState: string | null;
  personalZipCode: string | null;
  profilePhotoUrl: string | null;

  isTransgender: boolean;
}

const isPlaceholder = (url: string | null | undefined): boolean => {
  return url?.includes('example.com') ?? false;
};

export default function ProfilePage() {
  const [state, formAction] = useActionState<FormState, FormData>(updateProfile, { message: "" });
  const [user, setUser] = useState<UserProfile | null>(null); // Use UserProfile type
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAndSetUser() {
      const session = await getSession();
      if (session && session.user) {
        // Cast session.user to UserProfile to match state type
        setUser(session.user as UserProfile);
      }
    }
    fetchAndSetUser();
  }, [state?.message]); // Safely access state.message

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    });
  }

  if (!user) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <p className="text-sm text-gray-500">Loading profile…</p>
      </div>
    );
  }

  const hasPhoto = Boolean(user.profilePhotoUrl && !isPlaceholder(user.profilePhotoUrl));
  const initial = user.name ? user.name[0].toUpperCase() : "?";

  return (
    <div className="w-full max-w-4xl mx-auto">
      <header className="mb-8 flex items-center gap-5 hth-fade-up">
        {hasPhoto && user.profilePhotoUrl ? (
          <Image
            src={user.profilePhotoUrl}
            alt="Profile"
            width={80}
            height={80}
            className="h-20 w-20 shrink-0 rounded-full border-2 border-white object-cover shadow-md"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#2b2b2b] font-display text-4xl leading-none text-white shadow-md">
            {initial}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[#910000] uppercase tracking-[0.3em] text-xs font-semibold mb-2">Your Profile</p>
          <h1 className="truncate text-5xl text-gray-900 leading-none">{user.name || "Your profile"}</h1>
          <p className="mt-2 truncate text-sm text-gray-600">{user.email}</p>
        </div>
      </header>

      <form action={formAction} className="space-y-6 hth-fade-up hth-fade-up-delay-1">
        <FormSection step="01" title="Photo" description="A face helps our team and other members recognize you.">
          <Field name="profilePhoto" label="Profile photo" className="sm:col-span-2" hint="PNG or JPG. Square images look best.">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-gray-300 bg-gray-50">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="New photo preview" className="h-full w-full object-cover" />
                ) : hasPhoto && user.profilePhotoUrl ? (
                  <Image src={user.profilePhotoUrl} alt="Current profile photo" width={64} height={64} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-400">Preview</span>
                )}
              </div>
              <input
                id="profilePhoto"
                name="profilePhoto"
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.gif"
                onChange={onPhotoChange}
                className={fileInputClass}
              />
            </div>
          </Field>
        </FormSection>

        <FormSection step="02" title="Contact details" description="How we reach you.">
          <Field name="email" label="Email address" hideOptional className="sm:col-span-2" hint="Your email is your sign-in and can't be changed here.">
            <input
              id="email"
              name="email"
              type="email"
              value={user.email}
              readOnly
              autoComplete="email"
              className={`${inputClass} cursor-not-allowed bg-gray-50 text-gray-500`}
            />
          </Field>
          <Field name="name" label="Full name" required>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={user.name}
              required
              autoComplete="name"
              className={inputClass}
            />
          </Field>
          <Field name="phone" label="Phone" required>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              defaultValue={user.phone}
              required
              autoComplete="tel"
              placeholder="(555) 555-5555"
              className={inputClass}
            />
          </Field>
        </FormSection>

        <FormSection step="03" title="Home address" description="Used to match you with local programs and grants.">
          <Field name="personalAddress" label="Street address" className="sm:col-span-2">
            <input
              id="personalAddress"
              name="personalAddress"
              type="text"
              defaultValue={user.personalAddress || ''}
              autoComplete="street-address"
              className={inputClass}
            />
          </Field>
          <Field name="personalCity" label="City">
            <input
              id="personalCity"
              name="personalCity"
              type="text"
              defaultValue={user.personalCity || ''}
              autoComplete="address-level2"
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field name="personalState" label="State" hint="Two letters, e.g. NY">
              <input
                id="personalState"
                name="personalState"
                type="text"
                maxLength={2}
                defaultValue={user.personalState || ''}
                autoComplete="address-level1"
                placeholder="NY"
                className={`${inputClass} uppercase`}
              />
            </Field>
            <Field name="personalZipCode" label="ZIP">
              <input
                id="personalZipCode"
                name="personalZipCode"
                type="text"
                inputMode="numeric"
                maxLength={10}
                defaultValue={user.personalZipCode || ''}
                autoComplete="postal-code"
                className={inputClass}
              />
            </Field>
          </div>
        </FormSection>

        <FormError message={state?.error} />
        {!state?.error && <FormSuccess message={state?.message} />}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <RequiredNote />
          <SubmitButton>Update profile</SubmitButton>
        </div>
      </form>
    </div>
  );
}
