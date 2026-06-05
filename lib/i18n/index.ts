import { ar } from "./ar";
import { en } from "./en";
import type { Translations } from "./ar";

export type Language = "ar" | "en";

export { ar, en };
export type { Translations };

export function getTranslations(lang: Language): Translations {
  return lang === "ar" ? ar : en;
}
