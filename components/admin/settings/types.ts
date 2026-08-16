export type StoreStatus =
  | "open"
  | "closed";

export type AdminStoreSettings = {
  id: number;

  storeStatus: StoreStatus;
  storeClosedMessage:
    string | null;

  announcementEnabled:
    boolean;

  announcementMessage:
    string | null;

  announcementLinkLabel:
    string | null;

  announcementLinkUrl:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;
};

export type AdminAboutPageSettings = {
  id: number;

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

  createdAt: string;
  updatedAt: string;
};
