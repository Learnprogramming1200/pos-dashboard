"use client";

import { useEffect } from "react";
import { useGeneralSettings } from "@/contexts/GeneralSettingsContext";

/**
 * Dynamically updates the favicon on the client using the latest general settings.
 * This complements server-side metadata and helps when metadata caching is present.
 */
export default function DynamicFavicon() {
  const { generalSettings } = useGeneralSettings();

  useEffect(() => {
    if (!generalSettings) return;

    const faviconUrl =
      generalSettings?.logos?.favicon?.url || generalSettings?.favicon?.url;
    const appName = generalSettings?.appName;

    if (!faviconUrl) return;

    try {
      const applyFavicon = () => {
        // Update every icon link (covers cases where Next/head re-injects defaults)
        let iconLinks = Array.from(
          document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']")
        );

        if (iconLinks?.length === 0) {
          const link = document.createElement("link");
          link.rel = "icon";
          link.type = "image/x-icon";
          link.setAttribute("data-dynamic-favicon", "true");
          document.head.appendChild(link);
          iconLinks = [link];
        }

        iconLinks.forEach((link) => {
          link.href = faviconUrl;
          link.setAttribute("data-dynamic-favicon", "true");
        });

        // Ensure shortcut icon exists/updated
        let shortcut = document.querySelector<HTMLLinkElement>(
          "link[rel='shortcut icon']"
        );
        if (!shortcut) {
          shortcut = document.createElement("link");
          shortcut.rel = "shortcut icon";
          shortcut.setAttribute("data-shortcut-favicon", "true");
          document.head.appendChild(shortcut);
        }
        shortcut.href = faviconUrl;

        // Apple touch icon (safe)
        let apple = document.querySelector<HTMLLinkElement>(
          "link[rel='apple-touch-icon']"
        );

        if (!apple) {
          apple = document.createElement("link");
          apple.rel = "apple-touch-icon";
          apple.setAttribute("data-apple-favicon", "true");
          document.head.appendChild(apple);
        }

        apple.href = faviconUrl;

        if (appName) {
          document.title = appName;
        }
      };

      applyFavicon();

      // Re-apply if Next/head or navigation reintroduces the default favicon
      const observer = new MutationObserver((mutations) => {
        const touchedHead =
          mutations.some((m) =>
            Array.from(m.addedNodes).some((n) => n.nodeName === "LINK")
          ) || mutations.some((m) => m.target === document.head);

        if (touchedHead) {
          applyFavicon();
        }
      });

      observer.observe(document.head, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
      };
    } catch (err) {
      console.error("Favicon update failed:", err);
    }
  }, [generalSettings]);

  return null;
}

