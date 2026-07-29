"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { PHOTOS } from "@/lib/photos";
import { useLanguage } from "./LanguageProvider";

export function Gallery() {
  const { lang, copy } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpenIndex(null);
    lastFocused.current?.focus();
  }, []);

  const step = useCallback((delta: number) => {
    setOpenIndex((i) => (i === null ? i : (i + delta + PHOTOS.length) % PHOTOS.length));
  }, []);

  const open = (index: number) => {
    lastFocused.current = document.activeElement as HTMLElement | null;
    setOpenIndex(index);
  };

  useEffect(() => {
    if (openIndex === null) return;

    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      // In RTL the visual "next" is the left arrow, so mirror the mapping.
      else if (e.key === "ArrowRight") step(lang === "fa" ? -1 : 1);
      else if (e.key === "ArrowLeft") step(lang === "fa" ? 1 : -1);
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [openIndex, close, step, lang]);

  return (
    <section aria-labelledby="gallery-title">
      <h2 id="gallery-title" className="heading gold-text text-center text-2xl sm:text-3xl">
        {copy.galleryTitle}
      </h2>
      <p className="mt-2 text-center text-sm text-cream-dim">{copy.gallerySubtitle}</p>
      <div className="gold-rule mx-auto mt-4 h-px w-24 opacity-70" aria-hidden="true" />

      <ul className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5">
        {PHOTOS.map((photo, i) => (
          <li key={photo.src} className={i === 0 ? "col-span-2 sm:col-span-2 sm:row-span-2" : ""}>
            <button
              type="button"
              onClick={() => open(i)}
              aria-label={`${copy.photoAlt(photo.id)} — ${copy.galleryOpenHint}`}
              data-testid="gallery-thumb"
              className="group relative block h-full w-full overflow-hidden rounded-2xl ring-1 ring-gold/20 transition hover:ring-gold/60 focus-visible:ring-2 focus-visible:ring-gold-soft"
            >
              <div className={i === 0 ? "aspect-[4/3]" : "aspect-square"}>
                <Image
                  src={photo.src}
                  alt={copy.photoAlt(photo.id)}
                  fill
                  loading={i < 3 ? undefined : "lazy"}
                  priority={false}
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.06]"
                />
              </div>
              <span
                className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent opacity-70 transition group-hover:opacity-30"
                aria-hidden="true"
              />
            </button>
          </li>
        ))}
      </ul>

      {/* Lightbox --------------------------------------------------------- */}
      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={copy.galleryTitle}
          data-testid="lightbox"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/96 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label={copy.lightboxClose}
            data-testid="lightbox-close"
            className="absolute end-4 top-[max(1rem,env(safe-area-inset-top))] z-10 rounded-full border border-gold/35 bg-ink-soft/80 p-3 text-cream transition hover:text-gold-soft"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>

          <div className="relative h-[74svh] w-full max-w-4xl">
            <Image
              src={PHOTOS[openIndex].src}
              alt={copy.photoAlt(PHOTOS[openIndex].id)}
              fill
              sizes="100vw"
              className="rounded-2xl object-contain"
            />
          </div>

          {/* Logical start/end so the controls mirror correctly in RTL */}
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label={copy.lightboxPrev}
            data-testid="lightbox-prev"
            className="absolute start-3 rounded-full border border-gold/35 bg-ink-soft/80 p-3 text-cream transition hover:text-gold-soft"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="mirror-icon h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label={copy.lightboxNext}
            data-testid="lightbox-next"
            className="absolute end-3 rounded-full border border-gold/35 bg-ink-soft/80 p-3 text-cream transition hover:text-gold-soft"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="mirror-icon h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <p className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] text-xs tracking-widest text-cream-dim" dir="ltr">
            {openIndex + 1} / {PHOTOS.length}
          </p>
        </div>
      )}
    </section>
  );
}
