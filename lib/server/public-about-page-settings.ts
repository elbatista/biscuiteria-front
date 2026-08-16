import {
  ABOUT_PAGE_DEFAULTS,
  getAboutPageSettings,
} from "@/lib/server/about-page-settings";

export type PublicAboutPageSettings = {
  authorBadge: string;
  authorTitle: string;
  authorDescription1: string;
  authorDescription2: string;
  authorHighlight: string;

  authorImageMainUrl: string | null;
  authorImageMainAlt: string | null;
  authorImageSecondUrl: string | null;
  authorImageSecondAlt: string | null;
  authorImageThirdUrl: string | null;
  authorImageThirdAlt: string | null;

  brandBadge: string;
  brandTitle: string;
  brandDescription1: string;
  brandDescription2: string;

  makerName: string;
  city: string;
  sinceText: string;

  historyEyebrow: string;
  historyTitle: string;
  historySubtitle: string;
  historyDescription1: string;
  historyDescription2: string;

  metaTitle: string;
  metaDescription: string;
};

const PUBLIC_DEFAULTS: PublicAboutPageSettings = {
  authorBadge: ABOUT_PAGE_DEFAULTS.authorBadge,
  authorTitle: ABOUT_PAGE_DEFAULTS.authorTitle,
  authorDescription1: ABOUT_PAGE_DEFAULTS.authorDescription1,
  authorDescription2: ABOUT_PAGE_DEFAULTS.authorDescription2,
  authorHighlight: ABOUT_PAGE_DEFAULTS.authorHighlight,

  authorImageMainUrl: ABOUT_PAGE_DEFAULTS.authorImageMainUrl,
  authorImageMainAlt: ABOUT_PAGE_DEFAULTS.authorImageMainAlt,
  authorImageSecondUrl: ABOUT_PAGE_DEFAULTS.authorImageSecondUrl,
  authorImageSecondAlt: ABOUT_PAGE_DEFAULTS.authorImageSecondAlt,
  authorImageThirdUrl: ABOUT_PAGE_DEFAULTS.authorImageThirdUrl,
  authorImageThirdAlt: ABOUT_PAGE_DEFAULTS.authorImageThirdAlt,

  brandBadge: ABOUT_PAGE_DEFAULTS.brandBadge,
  brandTitle: ABOUT_PAGE_DEFAULTS.brandTitle,
  brandDescription1: ABOUT_PAGE_DEFAULTS.brandDescription1,
  brandDescription2: ABOUT_PAGE_DEFAULTS.brandDescription2,

  makerName: ABOUT_PAGE_DEFAULTS.makerName,
  city: ABOUT_PAGE_DEFAULTS.city,
  sinceText: ABOUT_PAGE_DEFAULTS.sinceText,

  historyEyebrow: ABOUT_PAGE_DEFAULTS.historyEyebrow,
  historyTitle: ABOUT_PAGE_DEFAULTS.historyTitle,
  historySubtitle: ABOUT_PAGE_DEFAULTS.historySubtitle,
  historyDescription1: ABOUT_PAGE_DEFAULTS.historyDescription1,
  historyDescription2: ABOUT_PAGE_DEFAULTS.historyDescription2,

  metaTitle: ABOUT_PAGE_DEFAULTS.metaTitle,
  metaDescription: ABOUT_PAGE_DEFAULTS.metaDescription,
};

export async function getPublicAboutPageSettings(): Promise<PublicAboutPageSettings> {
  try {
    const settings = await getAboutPageSettings();

    return {
      authorBadge: settings.authorBadge,
      authorTitle: settings.authorTitle,
      authorDescription1: settings.authorDescription1,
      authorDescription2: settings.authorDescription2,
      authorHighlight: settings.authorHighlight,

      authorImageMainUrl:
        settings.authorImageMainUrl || PUBLIC_DEFAULTS.authorImageMainUrl,
      authorImageMainAlt:
        settings.authorImageMainAlt || PUBLIC_DEFAULTS.authorImageMainAlt,
      authorImageSecondUrl:
        settings.authorImageSecondUrl || PUBLIC_DEFAULTS.authorImageSecondUrl,
      authorImageSecondAlt:
        settings.authorImageSecondAlt || PUBLIC_DEFAULTS.authorImageSecondAlt,
      authorImageThirdUrl:
        settings.authorImageThirdUrl || PUBLIC_DEFAULTS.authorImageThirdUrl,
      authorImageThirdAlt:
        settings.authorImageThirdAlt || PUBLIC_DEFAULTS.authorImageThirdAlt,

      brandBadge: settings.brandBadge,
      brandTitle: settings.brandTitle,
      brandDescription1: settings.brandDescription1,
      brandDescription2: settings.brandDescription2,

      makerName: settings.makerName,
      city: settings.city,
      sinceText: settings.sinceText,

      historyEyebrow: settings.historyEyebrow,
      historyTitle: settings.historyTitle,
      historySubtitle: settings.historySubtitle,
      historyDescription1: settings.historyDescription1,
      historyDescription2: settings.historyDescription2,

      metaTitle: settings.metaTitle,
      metaDescription: settings.metaDescription,
    };
  } catch (error) {
    console.error("PUBLIC_ABOUT_SETTINGS_ERROR", error);
    return PUBLIC_DEFAULTS;
  }
}
