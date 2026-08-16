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