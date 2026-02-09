export interface IFAQ {
  id?: string;
  _id?: string;
  question: string;
  answer: string;
  status?: boolean;
  isPublished?: boolean;
  createdAt?: string; 
  updatedAt?: string;
  slug?: string;
  __v?: number;
}
