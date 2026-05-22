"use client";

import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex h-9 w-9 items-center justify-center border-2 border-primary bg-mist text-primary shadow-hard transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M12 3a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zM5.64 5.64a1 1 0 011.42 0l.7.7a1 1 0 11-1.42 1.42l-.7-.7a1 1 0 010-1.42zM3 12a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zm2.64 6.36a1 1 0 010-1.42l.7-.7a1 1 0 111.42 1.42l-.7.7a1 1 0 01-1.42 0zM12 19a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm6.36-1.64a1 1 0 01-1.42 0l-.7-.7a1 1 0 111.42-1.42l.7.7a1 1 0 010 1.42zM19 12a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zm-1.64-6.36a1 1 0 010 1.42l-.7.7a1 1 0 11-1.42-1.42l.7-.7a1 1 0 011.42 0zM12 8a4 4 0 110 8 4 4 0 010-8z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      )}
    </button>
  );
}
