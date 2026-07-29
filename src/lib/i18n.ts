import type { Lang } from "./types";

export interface Copy {
  dir: "rtl" | "ltr";
  htmlLang: string;
  greetingPrefix: string;
  anniversaryLabel: string;
  invitation: string[];
  detailsTitle: string;
  whenLabel: string;
  whereLabel: string;
  directionsHint: string;
  countdownTitle: string;
  countdownUnits: { days: string; hours: string; minutes: string; seconds: string };
  countdownToday: string;
  countdownPast: string;
  calendarTitle: string;
  calendarApple: string;
  calendarGoogle: string;
  galleryTitle: string;
  gallerySubtitle: string;
  galleryOpenHint: string;
  lightboxClose: string;
  lightboxPrev: string;
  lightboxNext: string;
  footerClosing: string;
  switchTo: string;
  switchLabel: string;
  photoAlt: (n: number) => string;
  skipToContent: string;
  privateTitle: string;
  privateBody: string;
}

export const COPY: Record<Lang, Copy> = {
  fa: {
    dir: "rtl",
    htmlLang: "fa",
    greetingPrefix: "با درود",
    anniversaryLabel: "دهمین سالگرد ازدواج",
    invitation: [
      "ده سال پیش، دو قلب پیمان بستند که دست در دست هم، راه را تا انتها بروند.",
      "امروز، در آستانه‌ی دهمین سال این همراهی، دلمان می‌خواهد شیرینی این سال‌ها را با شما، عزیزانی که همیشه کنارمان بوده‌اید، قسمت کنیم.",
      "حضور گرم شما، زیباترین هدیه‌ی این شب خواهد بود.",
    ],
    detailsTitle: "جزئیات مراسم",
    whenLabel: "زمان",
    whereLabel: "مکان",
    directionsHint: "برای مسیریابی، روی نشانی بزنید",
    countdownTitle: "تا شب جشن",
    countdownUnits: { days: "روز", hours: "ساعت", minutes: "دقیقه", seconds: "ثانیه" },
    countdownToday: "امشب همان شب است!",
    countdownPast: "با سپاس از حضور گرم شما",
    calendarTitle: "افزودن به تقویم",
    calendarApple: "اپل / اوت‌لوک",
    calendarGoogle: "گوگل کلندر",
    galleryTitle: "لحظه‌های ما",
    gallerySubtitle: "ده سال، در چند قاب",
    galleryOpenHint: "برای دیدن بزرگ‌تر بزنید",
    lightboxClose: "بستن",
    lightboxPrev: "عکس قبلی",
    lightboxNext: "عکس بعدی",
    footerClosing: "با مهر، چشم‌انتظار دیدارتان هستیم",
    switchTo: "English",
    switchLabel: "تغییر زبان به انگلیسی",
    photoAlt: (n) => `عکس شماره ${n} از زوج`,
    skipToContent: "پرش به محتوای اصلی",
    privateTitle: "دعوت‌نامه‌ی خصوصی",
    privateBody: "این دعوت‌نامه شخصی است. لطفاً از پیوندی که برایتان فرستاده شده استفاده کنید.",
  },

  en: {
    dir: "ltr",
    htmlLang: "en",
    greetingPrefix: "Dear",
    anniversaryLabel: "Tenth Wedding Anniversary",
    invitation: [
      "Ten years ago, two hearts promised to walk the road together, hand in hand.",
      "Now, as we reach the tenth year of that journey, we would love to share its sweetness with you — the people who have been beside us all along.",
      "Your presence will be the most beautiful gift of the evening.",
    ],
    detailsTitle: "Event Details",
    whenLabel: "When",
    whereLabel: "Where",
    directionsHint: "Tap the address for directions",
    countdownTitle: "Until the celebration",
    countdownUnits: { days: "days", hours: "hours", minutes: "minutes", seconds: "seconds" },
    countdownToday: "Tonight is the night!",
    countdownPast: "Thank you for celebrating with us",
    calendarTitle: "Add to Calendar",
    calendarApple: "Apple / Outlook",
    calendarGoogle: "Google Calendar",
    galleryTitle: "Our Moments",
    gallerySubtitle: "Ten years, in a few frames",
    galleryOpenHint: "Tap to view larger",
    lightboxClose: "Close",
    lightboxPrev: "Previous photo",
    lightboxNext: "Next photo",
    footerClosing: "With love, we can't wait to see you",
    switchTo: "فارسی",
    switchLabel: "Switch language to Farsi",
    photoAlt: (n) => `Photo ${n} of the couple`,
    skipToContent: "Skip to main content",
    privateTitle: "Private Invitation",
    privateBody: "This invitation is personal. Please use the link that was sent to you.",
  },
};

export const DEFAULT_LANG: Lang = "fa";

export function isLang(value: unknown): value is Lang {
  return value === "fa" || value === "en";
}
