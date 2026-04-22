import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        id: "asc",
      },
    });

    const data = products.map((item) => ({
      ...item,
      id: item.id.toString(),
    }));

    return Response.json(data);
  } catch (error) {
    console.error("Error fetching Product rows:", error);

    return Response.json(
      { error: "Failed to fetch Product rows" },
      { status: 500 }
    );
  }
}