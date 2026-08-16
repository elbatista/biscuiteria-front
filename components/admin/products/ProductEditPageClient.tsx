"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import ProductEditSwitcher from "@/components/admin/products/ProductEditSwitcher";
import ProductForm, {
  type ProductFormHandle,
} from "@/components/admin/products/ProductForm";
import ProductImagesManager from "@/components/admin/products/ProductImagesManager";
import type {
  AdminCategoriesResponse,
  AdminCategoryOption,
  AdminCollectionOption,
  AdminCollectionsResponse,
  AdminProductDetail,
  AdminProductImage,
} from "@/components/admin/products/types";
import {
  sortCategoryOptions,
  sortCollectionOptions,
} from "@/components/admin/products/product-format";

type ProductEditPageClientProps = {
  productId: string;
};

function sortImages(images: AdminProductImage[]) {
  return [...images].sort((a, b) => a.sortOrder - b.sortOrder);
}

function getFirstImageUrl(images: AdminProductImage[]) {
  const firstImage = sortImages(images)[0];

  return firstImage?.thumbUrl || firstImage?.url || null;
}

export default function ProductEditPageClient({
  productId,
}: ProductEditPageClientProps) {
  const productFormRef = useRef<ProductFormHandle | null>(null);

  const [product, setProduct] = useState<AdminProductDetail | null>(null);
  const [productImages, setProductImages] = useState<AdminProductImage[]>([]);
  const [categories, setCategories] = useState<AdminCategoryOption[]>([]);
  const [collections, setCollections] = useState<AdminCollectionOption[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const previewImageUrl = useMemo(() => {
    return getFirstImageUrl(productImages);
  }, [productImages]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      setHasUnsavedChanges(false);

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
          .catch(() => null)) as
          | AdminCategoriesResponse
          | { message?: string }
          | null;

        const collectionsData = (await collectionsResponse
          .json()
          .catch(() => null)) as
          | AdminCollectionsResponse
          | { message?: string }
          | null;

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

        const loadedProduct = productData as AdminProductDetail;

        setProduct(loadedProduct);
        setProductImages(sortImages(loadedProduct.images));

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

  async function handleSaveCurrentProduct() {
    if (!productFormRef.current) {
      return false;
    }

    return productFormRef.current.save({
      redirect: false,
    });
  }

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
      <ProductEditSwitcher
        currentProductId={product.id}
        hasUnsavedChanges={hasUnsavedChanges}
        onSaveCurrentProduct={handleSaveCurrentProduct}
      />

      <ProductForm
        key={product.id}
        ref={productFormRef}
        mode="edit"
        initialProduct={{
          ...product,
          images: productImages,
        }}
        categories={categories}
        collections={collections}
        previewImageUrlOverride={previewImageUrl}
        onDirtyChange={setHasUnsavedChanges}
        onSaved={() => setHasUnsavedChanges(false)}
      />

      <ProductImagesManager
        key={`images-${product.id}`}
        productId={product.id}
        initialImages={productImages}
        onImagesChange={setProductImages}
      />
    </div>
  );
}