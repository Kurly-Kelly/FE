"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Heart } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  fetchProducts,
  fetchProductsByMainCategory,
} from "@/feature/productList/productList-api";
import { categories } from "@/feature/category/category-list";
import { categoryMapping } from "@/feature/category/category-mapping";
import { mainCategoryMapping } from "@/feature/category/category-mapping";
import { AuthContext } from "@/context/AuthContext";
import {
  addLike,
  cancelLike,
  checkIsLiked,
} from "@/feature/liked/api/liked-api";
import { SecondModal } from "@/components/modal/secondmodal";

interface Product {
  id: string;
  name: string;
  price: number; // 정가
  imageUrls: string[];
  delivery: string;
  category: string;
  discount?: number | null;
  isLiked?: boolean;
  likeCount?: number;
}

export default function ProductList() {
  const searchParams = useSearchParams();
  const mainParam = searchParams.get("main"); // 메인카테고리 파라미터
  const paramCategory = searchParams.get("category"); // 서브카테고리 파라미터
  const [currentPage, setCurrentPage] = useState(0); // 페이지 상태 추가
  const pageSize = 6; // 페이지당 항목 수
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const auth = useContext(AuthContext);
  // "로그인이 필요합니다" 모달 상태
  const [showLoginModal, setShowLoginModal] = useState(false);

  // mainParam에 따른 서브카테고리 목록
  const currentCategory = categories.find(
    (category) => category.name === mainParam
  );
  const subcategories = currentCategory?.subCategories || [];

  // URL 파라미터가 유효하면 이를 초기 선택된 탭으로 설정, 아니면 기본값 "전체보기" 사용
  const [selectedTab, setSelectedTab] = useState<string>(() => {
    if (paramCategory && subcategories.includes(paramCategory)) {
      return paramCategory;
    }
    return "전체보기";
  });

  const deliveryMapping: { [key: string]: string } = {
    GENERAL_DELIVERY: "일반배송",
    EARLY_DELIVERY: "새벽배송",
    SELLER_DELIVERY: "판매자직접배송",
  };

  // URL 파라미터 변경 시 selectedTab 업데이트
  useEffect(() => {
    if (paramCategory && subcategories.includes(paramCategory)) {
      setSelectedTab(paramCategory);
    }
  }, [paramCategory, subcategories]);

  // 상품 목록 불러오기
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        let data: Product[]; // Product 타입 명시
        let totalCount: number;

        if (selectedTab === "전체보기" && mainParam) {
          const mainCategoryCode = mainCategoryMapping[mainParam] || mainParam;
          const response = await fetchProductsByMainCategory(
            mainCategoryCode,
            currentPage,
            pageSize
          );
          data = response.content; // 상품 데이터
          totalCount = response.totalElements; // 총 상품 개수
        } else {
          const apiCategory = categoryMapping[selectedTab] || selectedTab;
          const response = await fetchProducts(
            apiCategory,
            currentPage,
            pageSize
          );
          data = response.content;
          totalCount = response.totalElements;
        }

        if (auth?.isLoggedIn && auth?.userInfo) {
          const productsWithLikeStatus = await Promise.all(
            data.map(async (product: Product) => {
              // Product 타입 명시
              try {
                const isLiked = await checkIsLiked(
                  auth.userInfo!.username,
                  Number(product.id)
                );
                return { ...product, isLiked };
              } catch (error) {
                console.error(
                  `좋아요 상태 확인 실패(상품 ID: ${product.id}:`,
                  error
                );
                return { ...product, isLiked: false };
              }
            })
          );
          setProducts(productsWithLikeStatus);
        } else {
          setProducts(
            data.map((product: Product) => ({ ...product, isLiked: false }))
          ); // Product 타입 명시
        }
        setTotalPages(Math.ceil(totalCount / pageSize));
      } catch (err) {
        setError("상품을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [selectedTab, currentPage, auth]);

  const calculateFinalPrice = (price: number, discount: number) => {
    const finalPrice = price - price * (discount / 100);
    return new Intl.NumberFormat().format(finalPrice); // 천 단위로 콤마 추가
  };

  // 페이지 버튼 클릭 시 페이지 변경 함수
  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  // 좋아요 토글 함수
  const toggleLike = async (product: Product) => {
    if (!auth?.isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    const productId = Number(product.id); // string을 number로 변환

    try {
      if (product.isLiked) {
        const response = await cancelLike(auth.userInfo!.username, productId);
        if (response.success) {
          setProducts((prevProducts) =>
            prevProducts.map((p) =>
              p.id === product.id ? { ...p, isLiked: false } : p
            )
          );
        } else {
          alert(response.message || "찜 취소에 실패했습니다.");
        }
      } else {
        const response = await addLike(auth.userInfo!.username, productId);
        if (response.success) {
          setProducts((prevProducts) =>
            prevProducts.map((p) =>
              p.id === product.id ? { ...p, isLiked: true } : p
            )
          );
        } else {
          alert(response.message || "찜 추가에 실패했습니다.");
        }
      }
    } catch (error) {
      console.error("좋아요 토글 실패:", error);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Navigation Tabs */}
      <div className="scrollbar-hide mb-4 flex overflow-x-auto whitespace-nowrap border-b">
        {subcategories.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`whitespace-nowrap px-4 py-2 ${
              tab === selectedTab
                ? "border-b-2 border-emerald-600 text-emerald-600"
                : "text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Loading & Error State */}
      {loading && (
        <div className="text-center text-gray-500">상품을 불러오는 중...</div>
      )}
      {error && <div className="text-center text-red-500">{error}</div>}

      {/* Product Count and Filters */}
      <div className="mb-4 flex items-center justify-between px-4">
        <span className="text-sm text-gray-600">총 {products.length}개</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-sm">
            추천순 <ChevronDown className="ml-1 size-4" />
          </Button>
          <Button variant="outline" size="sm" className="text-sm">
            필터
          </Button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-4 px-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/productDetail/${product.id}`}
            className="block"
          >
            <div className="relative flex flex-col rounded-none bg-white p-2 shadow-sm">
              <div className="relative h-[120px] w-[140px]">
                <Image
                  src={product.imageUrls[0] || "/placeholder.svg"}
                  alt={product.name}
                  layout="fill" // 부모 요소를 채우도록 설정
                  objectFit="cover" // 이미지 비율 유지
                  className="rounded-lg"
                />

                {/* 버튼 */}
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-4 right-4 rounded-full opacity-90 hover:opacity-100"
                  onClick={(e) => toggleLike(product)}
                >
                  <Heart
                    className={`size-5 transition-all duration-300 ${
                      product.isLiked
                        ? "fill-green-500 text-green-500"
                        : "fill-transparent text-green-500"
                    }`}
                  />
                </Button>
              </div>
              <p className="mb-1 text-xs text-gray-500">
                {deliveryMapping[product.delivery]}
              </p>
              <h3 className="mb-1 line-clamp-1 text-sm font-medium text-gray-800">
                {product.name}
              </h3>
              <div className="mb-1 flex items-center">
                {product.discount !== null && product.discount !== undefined ? (
                  <>
                    <span className="mr-1 text-base font-bold text-rose-500">
                      {product.discount}%
                    </span>
                    <span className="text-base font-bold">
                      {calculateFinalPrice(product.price, product.discount)}원
                    </span>
                  </>
                ) : (
                  <span className="text-base font-bold">
                    {product.price.toLocaleString()}원
                  </span>
                )}
              </div>
              {product.discount !== null && product.discount !== undefined && (
                <p className="text-xs text-gray-400 line-through">
                  {product.price.toLocaleString()}원
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
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
      {/* 로그인 모달 */}
      {showLoginModal && (
        <SecondModal
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          title="로그인이 필요합니다."
          description="로그인 페이지로 이동하시겠습니까?"
          confirmText="확인"
          cancelText="취소"
          onConfirm={() => {
            setShowLoginModal(false);
            router.push("/login");
          }}
        />
      )}
    </div>
  );
}
