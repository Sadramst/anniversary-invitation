export interface Photo {
  id: number;
  src: string;
}

/**
 * Next's image optimizer does not add `basePath` to the `url` it resolves, while
 * the public folder IS served under it - so the basePath has to be part of the
 * src or every optimized request 404s. Including it here keeps full AVIF/WebP
 * optimization working, which matters on mobile data.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/anniversary";

/**
 * The invitation uses a single portrait, washed almost all the way out behind
 * the paper texture. To use a different one, drop it in `public/photos/` and
 * change the filename here.
 */
export const MAIN_PHOTO: Photo = {
  id: 1,
  src: `${BASE_PATH}/photos/01.jpg`,
};

/** Used as the WhatsApp / Instagram share thumbnail for every invite. */
export const OG_PHOTO = MAIN_PHOTO.src;
