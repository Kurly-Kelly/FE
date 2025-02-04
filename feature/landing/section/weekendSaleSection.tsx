"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchProductsByDiscountStatus } from "@/feature/productList/fetchProductsByDiscountStatus";

interface Product {
  id: string;
  name: string;
  price: number;
  discount: number;
  imageUrls: string[];
  delivery: string;
  category: string;
}

type SortOption = "PRICE" | "DISCOUNT";
type SortDirection = "ASC" | "DESC";

export default function BudgetSection() {
  // 주말특가 상품 필터
  const discountStatus = "WEEKEND_SPECIAL";

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 6;
  const [totalPages, setTotalPages] = useState(1);

  // 상품 목록, 로딩, 에러
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 정렬 메뉴(드롭다운)
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  // 정렬 옵션과 방향
  const [sortOption, setSortOption] = useState<SortOption>("PRICE");
  const [direction, setDirection] = useState<SortDirection>("ASC");

  // 정렬 옵션 라벨
  const sortLabels: Record<SortOption, string> = {
    PRICE: "가격순",
    DISCOUNT: "할인율순",
  };

  const deliveryMapping: Record<string, string> = {
    GENERAL_DELIVERY: "일반배송",
    EARLY_DELIVERY: "새벽배송",
    SELLER_DELIVERY: "판매자 배송",
  };

  // 상품 불러오기 (서버에서 정렬된 데이터)
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchProductsByDiscountStatus(
          discountStatus,
          currentPage,
          pageSize,
          sortOption,
          direction,
        );

        const { content, totalElements } = response;
        setProducts(content);
        setTotalPages(Math.ceil(totalElements / pageSize));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError("주말특가 상품을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [discountStatus, currentPage, sortOption, direction]);

  // 페이지 변경
  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  // 정렬 옵션 변경
  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    setCurrentPage(0);
    setSortMenuOpen(false);
  };

  // 내림/오름차순 토글 버튼 클릭 시
  const handleToggleDirection = () => {
    setDirection((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    setCurrentPage(0);
  };

  // 지금 방향에 따른 라벨
  const directionLabel = direction === "ASC" ? "오름차순" : "내림차순";

  return (
    <div className="flex flex-col">
      {/* 섹션 헤더 */}
      <div className="mb-4 mt-2 flex items-center justify-between px-4">
        <h2 className="text-lg font-bold text-emerald-600">주말특가</h2>

        {/* 정렬/필터 버튼 그룹 */}
        <div className="relative flex gap-2">
          {/* 정렬 드롭다운 */}
          <div className="relative inline-block text-left">
            <Button
              variant="outline"
              size="sm"
              className="text-sm"
              onClick={() => setSortMenuOpen(!sortMenuOpen)}
            >
              {sortLabels[sortOption]} <ChevronDown className="ml-1 size-4" />
            </Button>
            {sortMenuOpen && (
              <div className="absolute right-0 z-10 mt-2 w-36 rounded-md bg-white shadow-md">
                <button
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  onClick={() => handleSortChange("PRICE")}
                >
                  가격순
                </button>
                <button
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  onClick={() => handleSortChange("DISCOUNT")}
                >
                  할인율순
                </button>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-sm"
            onClick={handleToggleDirection}
          >
            {directionLabel}
          </Button>
        </div>
      </div>

      {/* Loading & Error State */}
      {loading && (
        <div className="text-center text-gray-500">상품을 불러오는 중...</div>
      )}
      {error && <div className="text-center text-red-500">{error}</div>}

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-4 px-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/productDetail/${product.id}`}
            className="block"
          >
            <div className="relative flex flex-col bg-white p-2 shadow-sm">
              <Image
                src={product.imageUrls[0] || "/placeholder.svg"}
                alt={product.name}
                width={500}
                height={500}
                className="rounded-lg object-cover"
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-2 right-2 z-10 rounded-full bg-gray-200 p-1"
              >
                <ShoppingCart className="size-5 text-gray-600" />
              </Button>
              <p className="mb-1 text-xs text-gray-500">
                {deliveryMapping[product.delivery] || product.delivery}
              </p>
              <h3 className="mb-1 line-clamp-1 text-sm font-medium text-gray-800">
                {product.name}
              </h3>
              <div className="mb-1 flex items-center">
                <span className="mr-1 text-base font-bold text-rose-500">
                  {product.discount}%
                </span>
                <span className="text-base font-bold">
                  {(product.price * 0.65).toLocaleString()}원
                </span>
              </div>
              <p className="text-xs text-gray-400 line-through">
                {product.price.toLocaleString()}원
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          variant="outline"
          size="sm"
        >
          이전
        </Button>
        <span className="text-sm text-gray-600">
          <span className="font-bold text-black">{currentPage + 1}</span> /{" "}
          {totalPages}
        </span>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          variant="outline"
          size="sm"
        >
          다음
        </Button>
      </div>
    </div>
  );
}
