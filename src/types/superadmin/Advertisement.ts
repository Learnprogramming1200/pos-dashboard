export type AdvertisementSelectType = "Video" | "Image" | "Text";

export type AdvertisementUrlType = "Local" | "Url";

export type AdvertisementPlacement = "Hero Section" | "Pricing" | "Home Page";

export type AdvertisementPosition = "Left" | "Right" | "Center";

export type Advertisement = {
  _id: string;
  adName: string;
  selectType: AdvertisementSelectType;
  urlType: AdvertisementUrlType;
  placement: AdvertisementPlacement;
  position: AdvertisementPosition;
  redirectUrl: string;
  mediaContent?: {
    url: string;
    fileDetails?: {
      url: string;
      originalName: string;
      fileSize: number;
      mimeType: string;
    };
  };
  startDate: string;
  endDate: string;
  status: boolean;
  clickCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  lastCachePurge: string;
};

export type AdvertisementFormInput = {
  adName: string;
  selectType: AdvertisementSelectType;
  urlType: AdvertisementUrlType;
  placement: AdvertisementPlacement;
  position: AdvertisementPosition;
  redirectUrl: string;
  mediaUrl?: string;
  mediaFile?: File | string | null; // Can be File (before upload) or string URL (after upload)
  startDate: string;
  endDate: string;
  status: boolean;
  mediaContent?: {
    url: string;
  };

};

export type AdvertisementResponse = {
  advertisements: Advertisement[];
  pagination: PaginationInfo;
};

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}