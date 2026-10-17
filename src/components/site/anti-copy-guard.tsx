"use client";

import { useEffect } from "react";

/**
 * Anti-copy / anti-scraping deterrents for the public site.
 * - Disables right-click context menu (anti "Save As" / inspect)
 * - Disables drag-and-drop on images (anti image-copy)
 * - Blocks common dev-tools keyboard shortcuts (F12, Ctrl+Shift+I/J/C)
 * - Console warning for would-be cloners
 * Does NOT affect the admin panel (#admin hash) where these are needed.
 */
export function AntiCopyGuard() {
  useEffect(() => {
    const isAdmin = window.location.hash.includes("admin");

    const onContext = (e: MouseEvent) => {
      if (isAdmin) return; // allow in admin
      const target = e.target as HTMLElement;
      // allow context menu on form inputs/textareas (for paste etc.)
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;
      e.preventDefault();
    };

    const onDrag = (e: DragEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "IMG") e.preventDefault();
    };

    const onKey = (e: KeyboardEvent) => {
      if (isAdmin) return;
      // F12
      if (e.key === "F12") {
        e.preventDefault();
        return;
      }
      // Ctrl+Shift+I / J / C / U (dev tools / view source)
      if (
        e.ctrlKey &&
        e.shiftKey &&
        ["I", "J", "C", "U"].includes(e.key.toUpperCase())
      ) {
        e.preventDefault();
      }
      // Ctrl+U (view source)
      if (e.ctrlKey && !e.shiftKey && e.key.toUpperCase() === "U") {
        e.preventDefault();
      }
    };

    const onSelect = (e: Event) => {
      if (isAdmin) return;
      const t = e.target as HTMLElement;
      // prevent selecting large blocks of text (anti copy-paste scrape)
      if (
        t.tagName !== "INPUT" &&
        t.tagName !== "TEXTAREA" &&
        !t.isContentEditable
      ) {
        // allow selection but it's a mild deterrent; not blocking entirely
      }
    };

    // console warning
    const style = "color:#D32121;font-size:16px;font-weight:bold";
    console.log(
      "%c⚠ Big My Business — Protected Content",
      style
    );
    console.log(
      "%cThis website's content is proprietary. Unauthorized copying, scraping, or cloning is prohibited and may violate copyright law.",
      "color:#666;font-size:12px"
    );

    if (!isAdmin) {
      document.addEventListener("contextmenu", onContext);
      document.addEventListener("dragstart", onDrag);
      document.addEventListener("keydown", onKey);
      document.addEventListener("selectstart", onSelect);
    }

    return () => {
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("dragstart", onDrag);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("selectstart", onSelect);
    };
  }, []);

  return null;
}
