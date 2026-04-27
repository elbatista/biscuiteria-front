import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

export type PublicFaqItem = {
  id: number;
  question: string;
  answer: string;
  position: number;
};

export async function getPublicFaqItems(): Promise<PublicFaqItem[]> {
  noStore();
  return prisma.faqItem.findMany({
    where: {
      active: true,
    },
    orderBy: [{ position: "asc" }, { id: "asc" }],
    select: {
      id: true,
      question: true,
      answer: true,
      position: true,
    },
  });
}

export async function getPublicFaqPreview(limit = 4): Promise<PublicFaqItem[]> {
  return prisma.faqItem.findMany({
    where: {
      active: true,
    },
    orderBy: [{ position: "asc" }, { id: "asc" }],
    take: limit,
    select: {
      id: true,
      question: true,
      answer: true,
      position: true,
    },
  });
}