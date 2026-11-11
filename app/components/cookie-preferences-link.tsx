"use client";

export function CookiePreferencesLink() {
  return (
    <a
      href="#cookie-settings"
      onClick={(event) => {
        event.preventDefault();
        window.dispatchEvent(new Event("leor:open-cookie-settings"));
      }}
    >
      Cookie preferences
    </a>
  );
}
