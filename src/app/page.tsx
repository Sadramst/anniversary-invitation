import type { Metadata } from "next";

import { COPY } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Private Invitation",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Deliberately empty landing page.
 * Guest slugs are never listed anywhere - a link is only reachable if it was
 * shared directly. Both languages are rendered statically so no JS is required.
 */
export default function Landing() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="gold-rule h-px w-24 opacity-70" aria-hidden="true" />

      <section dir="rtl" lang="fa" className="max-w-md space-y-3">
        <h1 className="heading gold-text text-2xl">{COPY.fa.privateTitle}</h1>
        <p className="text-sm text-cream-dim">{COPY.fa.privateBody}</p>
      </section>

      <div className="gold-rule h-px w-16 opacity-40" aria-hidden="true" />

      <section dir="ltr" lang="en" className="max-w-md space-y-3">
        <h2 className="heading gold-text text-2xl">{COPY.en.privateTitle}</h2>
        <p className="text-sm text-cream-dim">{COPY.en.privateBody}</p>
      </section>

      <div className="gold-rule h-px w-24 opacity-70" aria-hidden="true" />
    </div>
  );
}
