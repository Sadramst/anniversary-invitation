export interface Photo {
  id: number;
  src: string;
  /**
   * CSS `object-position` for the hero. A phone viewport is far taller than
   * these landscape photos, so `object-cover` crops the sides hard - and the
   * couple is off-centre in several of them. Without a per-photo focal point
   * the default 50% centre slices their faces off at the edge of the screen.
   */
  focus?: string;
}

export const PHOTO_COUNT = 10;

/**
 * Next's image optimizer does not add `basePath` to the `url` it resolves, while
 * the public folder IS served under it - so the basePath has to be part of the
 * src or every optimized request 404s. Including it here keeps full AVIF/WebP
 * optimization working, which matters on mobile data.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/anniversary";

/**
 * The 10 couple photos.
 * To swap in the real photos: drop them into `public/photos/` named
 * 01.jpg .. 10.jpg (same names, any resolution) and redeploy. Nothing else changes.
 */
export const PHOTOS: Photo[] = Array.from({ length: PHOTO_COUNT }, (_, i) => ({
  id: i + 1,
  src: `${BASE_PATH}/photos/${String(i + 1).padStart(2, "0")}.jpg`,
}));

/**
 * Photos that crossfade behind the hero.
 *
 * Chosen for depth and colour rather than in file order: the Eiffel Tower, the
 * Florence sunset, the Paris love wall and the golden-hour park all hold up
 * under the dark scrim the hero text needs. The white-background studio portrait
 * deliberately stays out of the hero - it turns flat grey behind a scrim - and
 * is used as the share thumbnail and the opening gallery tile instead.
 */
export const HERO_PHOTOS: Photo[] = [
  { ...PHOTOS[9], focus: "68% 40%" }, // Eiffel Tower - couple stands well right of frame
  { ...PHOTOS[3], focus: "50% 38%" }, // Florence sunset
  { ...PHOTOS[1], focus: "50% 42%" }, // Paris love wall
  { ...PHOTOS[6], focus: "50% 40%" }, // golden-hour park
];

/** Used as the WhatsApp / Instagram share thumbnail for every invite. */
export const OG_PHOTO = PHOTOS[0].src;
