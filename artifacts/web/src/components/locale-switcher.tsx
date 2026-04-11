"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function getLocaleCookie(): string {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]*)/);
  return match ? match[1] : "en";
}

export function LocaleSwitcher() {
  const router = useRouter();
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    setLocale(getLocaleCookie());
  }, []);

  const toggle = () => {
    const next = locale === "en" ? "my" : "en";
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000`;
    setLocale(next);
    router.refresh();
  };

  return (
    <button
      onClick={toggle}
      className="px-2 py-1 text-xs font-semibold rounded-md hover:bg-accent"
      aria-label={`Language: ${locale === "en" ? "English" : "Myanmar"}. Click to switch.`}
      title={locale === "en" ? "Switch to Myanmar" : "Switch to English"}
    >
      {locale === "en" ? "EN" : "MY"}
    </button>
  );
}
