export const locales = ["en", "my"] as const;
export const defaultLocale = "en";
export type Locale = (typeof locales)[number];
