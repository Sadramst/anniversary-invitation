import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InvitationPage } from "@/components/InvitationPage";
import { absoluteUrl, allSlugs, couple, getInvitePageData, siteUrl } from "@/lib/invites";
import { OG_PHOTO } from "@/lib/photos";

/** One statically pre-rendered page per generated slug. */
export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

/** Any slug that is not in the guest list 404s instead of being rendered on demand. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = getInvitePageData(slug);
  if (!data) return { title: couple.english_names };

  const title = `${couple.english_names} — 10th Anniversary`;
  const description = `${data.invite.greeting.en}, you're invited to celebrate ${couple.tagline.en.toLowerCase()}.`;
  // OG_PHOTO already includes the basePath, so only the origin is prepended.
  const ogImage = `${siteUrl}${OG_PHOTO}`;

  return {
    title,
    description,
    // Never indexed - links are private and shared directly.
    robots: { index: false, follow: false, nocache: true },
    openGraph: {
      title,
      description,
      type: "website",
      url: absoluteUrl(`/${slug}`),
      images: [{ url: ogImage, width: 1600, height: 1200, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function InviteRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getInvitePageData(slug);
  if (!data) notFound();

  return <InvitationPage {...data} />;
}
