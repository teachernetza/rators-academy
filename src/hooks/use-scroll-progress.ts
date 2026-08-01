import { useEffect, useState } from "react";

/** Scroll progress (0-1) plus the id of the section currently in view. */
export function useScrollProgress(sectionIds: string[] = []) {
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>(sectionIds[0] ?? "");

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        const y = window.scrollY;
        setProgress(max > 0 ? Math.min(1, y / max) : 0);
        setScrolled(y > 12);

        let current = sectionIds[0] ?? "";
        for (const id of sectionIds) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= 140) current = id;
        }
        setActive(current);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sectionIds.join("|")]);

  return { progress, scrolled, active };
}
