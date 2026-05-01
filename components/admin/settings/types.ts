export type StoreStatus = "open" | "closed";

export type AdminStoreSettings = {
  id: number;

  storeStatus: StoreStatus;
  storeClosedMessage: string | null;

  originZipCode: string | null;
  originStreet: string | null;
  originNumber: string | null;
  originDistrict: string | null;
  originCity: string | null;
  originState: string | null;

  announcementEnabled: boolean;
  announcementMessage: string | null;
  announcementLinkLabel: string | null;
  announcementLinkUrl: string | null;

  createdAt: string;
  updatedAt: string;
};