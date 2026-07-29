export interface Photo {
  id: number;
  src: string;
}

export const PHOTO_COUNT = 10;

/**
 * Next's image optimizer does not add `basePath` to the `url` it resolves, while
 * the public folder IS served under it - so the basePath has to be part of the
 * src or every optimized request 404s. Including it here keeps full AVIF/WebP
 * optimization working, which matters on mobile data.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/inviteaniversery";

/**
 * The 10 couple photos.
 * To swap in the real photos: drop them into `public/photos/` named
 * 01.jpg .. 10.jpg (same names, any resolution) and redeploy. Nothing else changes.
 */
export const PHOTOS: Photo[] = Array.from({ length: PHOTO_COUNT }, (_, i) => ({
  id: i + 1,
  src: `${BASE_PATH}/photos/${String(i + 1).padStart(2, "0")}.jpg`,
}));

/** Photos that crossfade behind the hero. */
export const HERO_PHOTOS: Photo[] = [PHOTOS[0], PHOTOS[3], PHOTOS[6], PHOTOS[9]];

/** Used as the WhatsApp / Instagram share thumbnail for every invite. */
export const OG_PHOTO = PHOTOS[0].src;
