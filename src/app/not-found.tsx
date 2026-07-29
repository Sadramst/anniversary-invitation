import { COPY } from "@/lib/i18n";

/** Shown for any slug that is not in the guest list. Reveals nothing about valid links. */
export default function NotFound() {
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
