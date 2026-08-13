import { z } from "zod";

/** Optional +, digits, spaces, dashes, parentheses; 8–15 digits required. */
export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (!/^\+?[\d\s().-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone is required")
  .refine(isValidPhone, "Enter a valid phone number (digits only, 8–15 digits)");

export const optionalPhoneSchema = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || isValidPhone(v), "Enter a valid phone number (digits only, 8–15 digits)");

export const emailSchema = z.string().trim().email("Enter a valid email address");

export const optionalHttpUrlSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (v) => !v || /^https?:\/\/.+/i.test(v),
    "Enter a valid URL starting with http:// or https://",
  );
