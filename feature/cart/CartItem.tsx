import { Minus, Plus } from "lucide-react";
import Image from "next/image";

interface CartItemProps {
  item: {
    cartItemId: number;
    productName: string;
    price: number;
    quantity: number;
    imgURL: string;
  };
  isSelected: boolean;
  onSelect: (cartItemId: number) => void;
  onUpdateQuantity: (cartItemId: number, newQuantity: number) => void;
}

export function CartItem({
  item,
  isSelected,
  onSelect,
  onUpdateQuantity,
}: CartItemProps) {
  // URL 문자열 파싱
  let imageUrl = item.imgURL;
  if (typeof imageUrl === "string") {
    // 만약 이미지 URL이 "[url1, url2, url3]"와 같은 형식이라면 첫 번째 URL만 추출
    if (imageUrl.startsWith("[") && imageUrl.endsWith("]")) {
      const urlArray = imageUrl.slice(1, -1).split(",");
      imageUrl = urlArray[0].trim();
    }
    // https:/ 로 시작하는 URL을 https:// 로 변경
    if (imageUrl.startsWith("https:/") && !imageUrl.startsWith("https://")) {
      imageUrl = imageUrl.replace("https:/", "https://");
    }
  }

  return (
    <div className="flex items-start gap-4">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(item.cartItemId)}
        className="mt-2 size-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
      />
      <div className="flex flex-1 gap-4">
        <Image
          src={imageUrl}
          alt={item.productName}
          width={80} // 원하는 너비 (픽셀 단위)
          height={80} // 원하는 높이 (픽셀 단위)
          className="rounded-md object-cover"
        />
        <div className="flex-1">
          <h3 className="text-sm font-medium">{item.productName}</h3>
          <p className="mt-1 text-sm text-gray-900">
            {item.price.toLocaleString()}원
          </p>
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() =>
                onUpdateQuantity(item.cartItemId, item.quantity - 1)
              }
              className="rounded-md border p-2"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-8 text-center">{item.quantity}</span>
            <button
              onClick={() =>
                onUpdateQuantity(item.cartItemId, item.quantity + 1)
              }
              className="rounded-md border p-2"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
