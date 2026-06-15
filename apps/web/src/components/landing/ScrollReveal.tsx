"use client";

import { useEffect } from "react";

/**
 * ScrollReveal — mounts an IntersectionObserver that adds the `.in-view`
 * class to every element with the `.reveal` class as it enters the viewport.
 * Must be rendered once at the page level.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            // Unobserve after first reveal (fire-once)
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
