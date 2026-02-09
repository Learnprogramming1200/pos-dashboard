import { IFeature } from './Feature';

export interface IProductOverviewRow {
  _id: string;
  title: string;
  description: string;
  image?: string;
  overviewImage: string;
  features?: string[];
  color?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface IFeaturesResponse {
  message: string;
  status: number;
  data: IFeature[];
}
