"use client";

import { useEffect, useState } from "react";

import ProductForm from "@/components/admin/products/ProductForm";
import ProductImagesManager from "@/components/admin/products/ProductImagesManager";
import type {
  AdminCategoriesResponse,
  AdminCategoryOption,
  AdminCollectionOption,
  AdminCollectionsResponse,
  AdminProductDetail,
} from "@/components/admin/products/types";
import {
  sortCategoryOptions,
  sortCollectionOptions,
} from "@/components/admin/products/product-format";

type ProductEditPageClientProps = {
  productId: string;
};

export default function ProductEditPageClient({
  productId,
}: ProductEditPageClientProps) {
  const [product, setProduct] = useState<AdminProductDetail | null>(null);
  const [categories, setCategories] = useState<AdminCategoryOption[]>([]);
  const [collections, setCollections] = useState<AdminCollectionOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        const [productResponse, categoriesResponse, collectionsResponse] =
          await Promise.all([
            fetch(`/api/admin/products/${productId}`, {
              credentials: "include",
            }),
            fetch("/api/admin/categories?page=1&pageSize=500", {
              credentials: "include",
            }),
            fetch("/api/admin/collections?page=1&pageSize=500", {
              credentials: "include",
            }),
          ]);

        const productData = (await productResponse.json().catch(() => null)) as
          | AdminProductDetail
          | { message?: string }
          | null;

        const categoriesData = (await categoriesResponse
          .json()
          .catch(() => null)) as AdminCategoriesResponse | { message?: string } | null;

        const collectionsData = (await collectionsResponse
          .json()
          .catch(() => null)) as AdminCollectionsResponse | { message?: string } | null;

        if (!productResponse.ok) {
          setError(
            productData && "message" in productData && productData.message
              ? productData.message
              : "Não foi possível carregar o produto."
          );
          return;
        }

        if (!categoriesResponse.ok) {
          setError(
            categoriesData &&
              "message" in categoriesData &&
              categoriesData.message
              ? categoriesData.message
              : "Não foi possível carregar categorias."
          );
          return;
        }

        if (!collectionsResponse.ok) {
          setError(
            collectionsData &&
              "message" in collectionsData &&
              collectionsData.message
              ? collectionsData.message
              : "Não foi possível carregar coleções."
          );
          return;
        }

        setProduct(productData as AdminProductDetail);
        setCategories(
          sortCategoryOptions(
            (categoriesData as AdminCategoriesResponse).items ?? []
          )
        );
        setCollections(
          sortCollectionOptions(
            (collectionsData as AdminCollectionsResponse).items ?? []
          )
        );
      } catch {
        setError("Erro de conexão ao carregar produto.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 text-sm text-zinc-500 shadow-sm">
        Carregando produto...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ProductForm
        mode="edit"
        initialProduct={product}
        categories={categories}
        collections={collections}
      />

      <ProductImagesManager
        productId={product.id}
        initialImages={product.images}
      />
    </div>
  );
}