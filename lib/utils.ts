import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a Date object to a localized string.
 * @param date - The date to format
 * @param locale - The locale string (e.g. "ar-IQ", "en-US")
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  locale: string = "ar-IQ"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Get the initials from a full name (supports Arabic and English).
 * @param name - The full name
 * @returns 1-2 character initials string
 */
export function getInitials(name: string): string {
  if (!name) return "؟";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
