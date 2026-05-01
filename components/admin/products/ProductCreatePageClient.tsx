"use client";

import { useEffect, useState } from "react";

import ProductForm from "@/components/admin/products/ProductForm";
import type {
  AdminCategoriesResponse,
  AdminCategoryOption,
  AdminCollectionOption,
  AdminCollectionsResponse,
} from "@/components/admin/products/types";
import {
  sortCategoryOptions,
  sortCollectionOptions,
} from "@/components/admin/products/product-format";

export default function ProductCreatePageClient() {
  const [categories, setCategories] = useState<AdminCategoryOption[]>([]);
  const [collections, setCollections] = useState<AdminCollectionOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOptions() {
      setIsLoading(true);
      setError(null);

      try {
        const [categoriesResponse, collectionsResponse] = await Promise.all([
          fetch("/api/admin/categories?page=1&pageSize=500&active=true", {
            credentials: "include",
          }),
          fetch("/api/admin/collections?page=1&pageSize=500&active=true", {
            credentials: "include",
          }),
        ]);

        const categoriesData = (await categoriesResponse
          .json()
          .catch(() => null)) as AdminCategoriesResponse | { message?: string } | null;

        const collectionsData = (await collectionsResponse
          .json()
          .catch(() => null)) as AdminCollectionsResponse | { message?: string } | null;

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

        setCategories(
          sortCategoryOptions(
            ((categoriesData as AdminCategoriesResponse).items ?? []).filter(
              (item) => item.isActive
            )
          )
        );

        setCollections(
          sortCollectionOptions(
            ((collectionsData as AdminCollectionsResponse).items ?? []).filter(
              (item) => item.isActive
            )
          )
        );
      } catch {
        setError("Erro de conexão ao carregar opções do produto.");
      } finally {
        setIsLoading(false);
      }
    }

    loadOptions();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 text-sm text-zinc-500 shadow-sm">
        Carregando opções do produto...
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

  return (
    <ProductForm
      mode="create"
      categories={categories}
      collections={collections}
    />
  );
}