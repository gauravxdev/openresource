export interface Category {
  id: string;
  name: string;
  slug: string;
  status: string;
  addedBy: string | null;
  userId: string | null;
  createdAt: Date | string;
  rejectionReason: string | null;
  user?: {
    name: string | null;
    email: string | null;
  } | null;
  _count?: {
    resources: number;
  };
}
