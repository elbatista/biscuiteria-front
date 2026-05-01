export type AdminFaqItem = {
  id: number;
  question: string;
  answer: string;
  active: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminFaqResponse = {
  items: AdminFaqItem[];
};

export type FaqFormValues = {
  question: string;
  answer: string;
  active: boolean;
  position: number;
};