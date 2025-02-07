"use client";

import { useState, useContext, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OrderItems } from "@/feature/payment/orderItems";
import { CustomerInfoSection } from "@/feature/payment/customerInfo";
import { DeliveryAddressSection } from "@/feature/payment/deliveryAddress";
import { DeliveryNotes } from "@/feature/payment/deliveryNote";
// import { PointsSection } from "@/feature/payment/pointSection";
import { AuthContext } from "@/context/AuthContext";
import { Footer } from "@/components/layout/footer";
import { CheckoutPage } from "@/feature/payment/checkoutPage";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import myApi from "@/lib/axios";

// 주문 관련 타입
interface DeliveryAddress {
  zipCode?: string;
  address: string;
  detailAddress: string;
  deliveryNote: string;
}

interface OrderItem {
  id: number;
  name: string;
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

// LocalStorage 키
const ORDER_DATA_KEY = "orderData";

export default function OrderPage() {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const { userInfo } = authContext || {}; //isLoading, isLoggedIn 제외

  // 장바구니 아이템
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);

  // 포인트
  // const [localUsedPoints, setLocalUsedPoints] = useState(0);

  // 배송지
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    zipCode: "",
    address: "",
    detailAddress: "",
    deliveryNote: "",
  });

  // 주문자 정보(유저 정보)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
  });

  useEffect(() => {
    if (userInfo) {
      setCustomerInfo({
        name: userInfo.name || "",
        phone: userInfo.phoneNumber || "",
      });
    }
  }, [userInfo]);

  // 1) 장바구니 불러오기
  useEffect(() => {
    async function fetchCart() {
      try {
        setItemsLoading(true);
        setItemsError(null);
        const token = localStorage.getItem("accessToken");
        const res = await myApi.get("/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        console.log("cart data:", data);
        setCartItems(data.cartItems || []);
      } catch (err) {
        console.error("장바구니 조회 실패:", err);
        setItemsError("장바구니를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setItemsLoading(false);
      }
    }
    fetchCart();
  }, []);

  // 2) cartItems → items
  const items: OrderItem[] = cartItems.map((item) => ({
    id: item.productId,
    name: item.productName,
    price: item.price,
    quantity: item.quantity,
    discount: item.discount,
  }));

  // 3) 결제금액 계산
  const subtotal = items.reduce(
    (sum, it) =>
      sum + (it.price - it.price * (it.discount / 100)) * it.quantity,
    0,
  );
  const shippingFee = 3000;
  // const discount = localUsedPoints;
  const total = subtotal + shippingFee;

  // 뒤로가기
  const goToBack = () => {
    router.back();
  };

  // 배송지 onSave
  const handleSaveDelivery = (addr: {
    zipCode?: string;
    address: string;
    detailAddress: string;
  }) => {
    setDeliveryAddress((prev) => ({
      ...prev,
      ...addr,
    }));
    console.log("[OrderPage] updated deliveryAddress:", addr);
  };

  // 포인트 onChange
  // const handlePointsChange = (points: number) => {
  //   setLocalUsedPoints(points);
  // };

  const handleSaveDeliveryNote = (note: string) => {
    const updatedDeliveryAddress = {
      ...deliveryAddress,
      deliveryNote: note,
    };
    setDeliveryAddress(updatedDeliveryAddress);

    const updatedOrderData: OrderData = {
      customerInfo,
      deliveryAddress: updatedDeliveryAddress,
      items,
      usedPoints: 0,
      totalPrice: total,
    };
    localStorage.setItem(ORDER_DATA_KEY, JSON.stringify(updatedOrderData));
    console.log(
      "[OrderPage] Updated deliveryNote and saved to localStorage:",
      // eslint-disable-next-line prettier/prettier
      updatedOrderData
    );
  };

  // LocalStorage에 저장 함수
  function saveOrderDataToLocalStorage() {
    // 구성
    const orderData: OrderData = {
      customerInfo,
      deliveryAddress,
      items,
      usedPoints: 0,
      totalPrice: total,
    };

    // JSON 직렬화 후 저장
    localStorage.setItem(ORDER_DATA_KEY, JSON.stringify(orderData));
    console.log("[OrderPage] save to localStorage:", orderData);
  }

  if (itemsLoading) return <div>상품 로딩 중...</div>;
  if (itemsError) return <div>{itemsError}</div>;

  return (
    <div className="bg-gray-100">
      <div className="mx-auto max-w-[360px] space-y-6 bg-white p-4">
        {/* 상단 */}
        <div className="flex items-center gap-24 text-center">
          <Button variant="ghost" size="icon" onClick={goToBack}>
            <ChevronLeft className="size-4" />
          </Button>
          <h1 className="text-lg font-bold">주문서</h1>
        </div>

        <OrderItems items={cartItems} />

        {/* 주문자 정보 */}
        <div className=" h-3 !w-[360px] translate-x-[-14px] bg-gray-100" />
        <CustomerInfoSection info={customerInfo} />

        {/* 배송지 */}
        <div className=" h-3 !w-[360px] translate-x-[-14px] bg-gray-100" />
        <DeliveryAddressSection
          savedAddress={deliveryAddress}
          onSave={handleSaveDelivery}
        />

        {/* 요청사항 */}
        <div className=" h-3 !w-[360px] translate-x-[-14px] bg-gray-100" />
        <DeliveryNotes
          deliveryNote={deliveryAddress.deliveryNote}
          onSave={handleSaveDeliveryNote}
        />

        {/* 포인트 */}
        {/* <div className=" h-3 !w-[360px] translate-x-[-14px] bg-gray-100" />
        <PointsSection
          availablePoints={1000}
          onPointsChange={handlePointsChange}
        /> */}

        {/* 결제 금액 */}
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

        {/* CheckoutPage */}
        <CheckoutPage
          totalAmount={total}
          onSaveOrderData={saveOrderDataToLocalStorage}
        />
      </div>
      <Footer />
    </div>
  );
}
