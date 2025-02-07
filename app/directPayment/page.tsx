"use client";

import { useState, useContext, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OrderItems } from "@/feature/payment/orderItems";
import { CustomerInfoSection } from "@/feature/payment/customerInfo";
import { DeliveryAddressSection } from "@/feature/payment/deliveryAddress";
import { DeliveryNotes } from "@/feature/payment/deliveryNote";
import { AuthContext } from "@/context/AuthContext";
import { Footer } from "@/components/layout/footer";
import { CheckoutPage } from "@/feature/payment/checkoutPage";
import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import myApi from "@/lib/axios";

// ──────────────────────────────
// 타입 정의
// ──────────────────────────────

interface ProductData {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  productStatus: "AVAILABLE" | "UNAVAILABLE";
  mainCategory: string;
  subCategory: string;
  imageUrls: string[];
  discount: number;
}

interface DeliveryAddress {
  zipCode?: string;
  address: string;
  detailAddress: string;
  deliveryNote: string;
}

interface OrderItem {
  id: number;
  productName: string;
  price: number;
  quantity: number;
  discount: number;
}

interface CustomerInfo {
  name: string;
  phone: string;
}

interface OrderData {
  customerInfo: CustomerInfo;
  deliveryAddress: DeliveryAddress;
  items: OrderItem[];
  usedPoints: number;
  totalPrice: number;
}

const ORDER_DATA_KEY = "orderData";

// ──────────────────────────────
// DirectPaymentPage 컴포넌트
// ──────────────────────────────

export default function DirectPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 쿼리에서 productId와 수량(quantity) 추출
  const productIdParam = searchParams.get("productId");
  const quantityParam = searchParams.get("quantity");
  const productId = productIdParam ? parseInt(productIdParam) : null;
  const selectedQuantity = quantityParam ? parseInt(quantityParam) : 1;

  const authContext = useContext(AuthContext);
  const { userInfo } = authContext || {};

  // 상품 정보 관련 상태
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 주문에 필요한 주문자 정보와 배송지 상태
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
  });
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    zipCode: "",
    address: "",
    detailAddress: "",
    deliveryNote: "",
  });

  // 로그인된 사용자가 있다면 주문자 정보 미리 채워주기
  useEffect(() => {
    if (userInfo) {
      setCustomerInfo({
        name: userInfo.name || "",
        phone: userInfo.phoneNumber || "",
      });
    }
  }, [userInfo]);

  // 상품 정보를 백엔드에서 불러오기
  useEffect(() => {
    if (!productId) {
      setError("상품 ID가 제공되지 않았습니다.");
      setLoading(false);
      return;
    }
    async function fetchProduct() {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await myApi.get(`/product/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProductData(res.data);
        console.log(res.data);
      } catch (err) {
        console.error("상품 정보 조회 실패:", err);
        setError("상품 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  if (loading) return <div>상품 로딩 중...</div>;
  if (error) return <div>{error}</div>;
  if (!productData) return <div>상품 정보를 찾을 수 없습니다.</div>;

  // 단일 주문상품 구성
  const orderItem: OrderItem = {
    id: productData.id,
    productName: productData.name,
    price: productData.price,
    quantity: selectedQuantity,
    discount: productData.discount,
  };

  // 결제 금액 계산
  const subtotal =
    (orderItem.price - orderItem.price * (orderItem.discount / 100)) *
    orderItem.quantity;
  const shippingFee = 3000;
  const total = subtotal + shippingFee;

  // ──────────────────────────────
  // 핸들러 함수들
  // ──────────────────────────────

  // 배송지 정보 저장 (배송지 입력값 업데이트)
  const handleSaveDelivery = (addr: {
    zipCode?: string;
    address: string;
    detailAddress: string;
  }) => {
    setDeliveryAddress((prev) => ({
      ...prev,
      ...addr,
    }));
    console.log("[DirectPaymentPage] updated deliveryAddress:", addr);
  };

  // 배송 요청사항(배송 메모) 저장 후 주문 데이터를 로컬 스토리지에 저장
  const handleSaveDeliveryNote = (note: string) => {
    const updatedAddress = {
      ...deliveryAddress,
      deliveryNote: note,
    };
    setDeliveryAddress(updatedAddress);

    const orderData: OrderData = {
      customerInfo,
      deliveryAddress: updatedAddress,
      items: [orderItem],
      usedPoints: 0,
      totalPrice: total,
    };
    localStorage.setItem(ORDER_DATA_KEY, JSON.stringify(orderData));
    console.log("[DirectPaymentPage] Saved order data:", orderData);
  };

  // CheckoutPage에서 결제 진행 전에 주문 데이터를 로컬 스토리지에 저장
  function saveOrderDataToLocalStorage() {
    const orderData: OrderData = {
      customerInfo,
      deliveryAddress,
      items: [orderItem],
      usedPoints: 0,
      totalPrice: total,
    };
    localStorage.setItem(ORDER_DATA_KEY, JSON.stringify(orderData));
    console.log("[DirectPaymentPage] Order data saved:", orderData);
  }

  // 뒤로가기
  const goToBack = () => {
    router.back();
  };

  return (
    <div className="bg-gray-100">
      <div className="mx-auto max-w-[360px] space-y-6 bg-white p-4">
        {/* 상단 헤더 */}
        <div className="flex items-center gap-24 text-center">
          <Button variant="ghost" size="icon" onClick={goToBack}>
            <ChevronLeft className="size-4" />
          </Button>
          <h1 className="text-lg font-bold">주문서</h1>
        </div>

        {/* 주문상품 정보 */}
        <OrderItems items={[orderItem]} />

        {/* 주문자 정보 */}
        <div className="h-3 !w-[360px] translate-x-[-14px] bg-gray-100" />
        <CustomerInfoSection info={customerInfo} />

        {/* 배송지 입력 */}
        <div className="h-3 !w-[360px] translate-x-[-14px] bg-gray-100" />
        <DeliveryAddressSection
          savedAddress={deliveryAddress}
          onSave={handleSaveDelivery}
        />

        {/* 배송 요청사항 */}
        <div className="h-3 !w-[360px] translate-x-[-14px] bg-gray-100" />
        <DeliveryNotes
          deliveryNote={deliveryAddress.deliveryNote}
          onSave={handleSaveDeliveryNote}
        />

        {/* 결제 금액 요약 */}
        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between">
            <span>상품금액</span>
            <span>{subtotal.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between">
            <span>상품할인금액</span>
            <span>{0}원</span>
          </div>
          <div className="flex justify-between">
            <span>배송비</span>
            <span className="text-green-600">
              + {shippingFee.toLocaleString()}원
            </span>
          </div>
          <div className="flex justify-between font-medium">
            <span>결제예정금액</span>
            <span>{total.toLocaleString()}원</span>
          </div>
        </div>

        {/* 결제 진행(CheckoutPage) */}
        <CheckoutPage
          totalAmount={total}
          onSaveOrderData={saveOrderDataToLocalStorage}
        />
      </div>
      <Footer />
    </div>
  );
}
