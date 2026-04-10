import { useTranslation } from 'react-i18next';

export type Language = 'en' | 'my';

export function useLanguage() {
  const { i18n } = useTranslation();

  const setLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('scla_language', lang);
  };

  return {
    language: (i18n.language as Language) ?? 'en',
    setLanguage,
  };
}
