"use client";

import { Footer } from "@/components/layout/footer";
import { ProductListHeader } from "@/feature/productList/productList-header";
import ProductList from "@/feature/productList/productList";

export default function CategoryDetailPage() {
  return (
    <div className="flex h-screen w-full justify-center bg-gray-100">
      <div className="flex w-[360px] flex-col bg-white pb-[52px]">
        <ProductListHeader />
        <main className="grow overflow-y-auto">
          <ProductList />
        </main>
        <Footer />
      </div>
    </div>
  );
}
