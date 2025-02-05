"use client";

import { addToCart } from "@/feature/productDetail/ProductDetailButton-api"; // addToCart 함수 임포트
import { useRouter } from "next/navigation";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Heart } from "lucide-react";
import {
  checkIsLiked,
  getLikeCount,
  cancelLike,
  addLike,
} from "@/feature/liked/api/liked-api";
import { SecondModal } from "@/components/modal/secondmodal";

interface PurchaseButtonProps {
  cartItemId: number;
  productId: number;
  productStatus: "AVAILABLE" | "UNAVAILABLE";
}

export default function PurchaseButton({
  cartItemId,
  productId,
  productStatus,
}: PurchaseButtonProps) {
  const router = useRouter();
  const auth = useContext(AuthContext);

  console.log("상품 상태", productStatus);

  // 찜 여부 & 찜 개수
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);

  // "로그인이 필요합니다" 모달 상태
  const [showLoginModal, setShowLoginModal] = useState(false);
  // "장바구니로 이동" 모달 상태
  const [showCartModal, setShowCartModal] = useState(false);

  const goToPayment = () => {
    router.push("/payment");
  };

  useEffect(() => {
    async function fetchLikeCount() {
      try {
        const count = await getLikeCount(productId);
        setLikeCount(count);
      } catch (error) {
        console.error("좋아요 갯수 불러오기 실패:", error);
      }
    }
    fetchLikeCount();
  }, [productId]);

  useEffect(() => {
    if (auth?.isLoggedIn && auth?.userInfo) {
      checkIsLiked(auth.userInfo.username, productId)
        .then((liked) => {
          setIsLiked(liked);
        })
        .catch((error) => {
          console.error("찜 여부 확인 실패:", error);
        });
    }
  }, [auth, productId]);

  // 장바구니 담기 API 호출
  const handleAddToCartAndNavigate = async () => {
    try {
      if (!auth?.isLoggedIn) {
        setShowLoginModal(true);
        return;
      }

      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("권한이 없습니다. 로그인 상태를 확인하세요.");
        return;
      }

      const response = await addToCart(cartItemId, 1, token);

      if (response.status === 200) {
        setShowCartModal(true);
      }
    } catch (error) {
      console.error("장바구니 추가 중 오류 발생:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          alert("권한이 없습니다. 로그인 상태를 확인하세요.");
        } else {
          alert("장바구니에 담는 데 실패했습니다.");
        }
      } else {
        alert("알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  // 구매하기 로직
  const handleBuyNow = () => {
    goToPayment();
  };

  // 찜 토글 (좋아요)
  const handleLikeToggle = async () => {
    if (!auth?.isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("권한이 없습니다. 로그인 상태를 확인하세요.");
      return;
    }

    try {
      if (isLiked) {
        // 이미 찜 -> 찜 취소
        await cancelLike(auth.userInfo!.username, productId);
        setIsLiked(false);
        setLikeCount((prev) => Math.max(prev - 1, 0));
      } else {
        // 찜 추가
        await addLike(auth.userInfo!.username, productId);
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error: any) {
      console.error("찜 토글 실패:", error);
      alert("찜 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-10 bg-gray-100">
      <div className="mx-auto w-full max-w-[360px] bg-white">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* 찜하기 버튼 */}
          <button
            onClick={handleLikeToggle}
            className="flex size-12 flex-col items-center justify-center rounded-full border-2 border-gray-200 transition-all duration-300 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label={isLiked ? "찜 취소하기" : "찜하기"}
          >
            <Heart
              className={`size-5 transition-all duration-300 ${
                isLiked
                  ? "scale-110 fill-green-500 text-green-500"
                  : "text-gray-400 hover:text-green-500"
              }`}
            />
            <span className="mt-1 text-xs font-medium text-gray-600">
              {likeCount}
            </span>
          </button>

          {/* 상품 상태에 따른 버튼 렌더링 */}
          {productStatus === "UNAVAILABLE" ? (
            /* 품절된 상품일 경우 */
            <button
              className="flex-1 cursor-not-allowed rounded bg-gray-400 py-4 text-white"
              disabled
            >
              현재 품절된 상품입니다.
            </button>
          ) : (
            /* 판매 중인 상품일 경우, 장바구니 + 구매하기 버튼 */
            <>
              {/* 장바구니 담기 버튼 */}
              <button
                onClick={handleAddToCartAndNavigate}
                className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                장바구니 담기
              </button>

              {/* 구매하기 버튼 */}
              <button
                onClick={handleBuyNow}
                className="flex-1 rounded-full bg-green-500 px-4 py-3.5 text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                구매하기
              </button>
            </>
          )}
        </div>
      </div>

      {/* 로그인 필요 모달 */}
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
      {/* 장바구니로 이동 모달 */}
      <SecondModal
        open={showCartModal}
        onClose={() => setShowCartModal(false)}
        title="장바구니에 추가되었습니다."
        description="장바구니로 이동하시겠습니까?"
        confirmText="이동"
        cancelText="계속 쇼핑"
        onConfirm={() => {
          setShowCartModal(false);
          router.push("/cart");
        }}
      />
    </div>
  );
}
