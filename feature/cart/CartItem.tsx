import { Minus, Plus } from "lucide-react";

interface CartItemProps {
  item: {
    cartItemId: number;
    productName: string;
    price: number;
    discount: number;
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
  return (
    <div className="flex items-start gap-4">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(item.cartItemId)}
        className="mt-2 size-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
      />
      <div className="flex flex-1 gap-4">
        <img
          src={item.imgURL}
          alt={item.productName}
          className="size-20 rounded-md object-cover"
        />
        <div className="flex-1">
          <h3 className="text-sm font-medium">{item.productName}</h3>
          <p className="mt-1 text-sm text-gray-900">
            {(item.price - item.price * (item.discount / 100)).toLocaleString()}
            원
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
