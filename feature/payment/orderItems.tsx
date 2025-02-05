"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// OrderItem 타입 (JS라면 생략 가능)
export interface OrderItem {
  id: number;
  productName: string;
  price: number;
  quantity: number;
  discount: number;
}

interface OrderItemsProps {
  items: OrderItem[];
}

export function OrderItems({ items }: OrderItemsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showMore, setShowMore] = useState(false);

  if (!items || items.length === 0) {
    return <div>구매할 상품이 없습니다.</div>;
  }

  // showMore = true → 전체 items 표시
  // showMore = false → 첫 번째 상품만 표시
  const displayItems = showMore ? items : [items[0]];
  console.log(items);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <CollapsibleTrigger className="flex w-full items-center justify-between font-medium">
        주문상품
        {isOpen ? (
          <ChevronUp className="size-4" />
        ) : (
          <ChevronDown className="size-4" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2">
        {displayItems.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex justify-between py-2 text-sm"
          >
            <span>
              {item.productName} x{item.quantity}
            </span>
            <span>
              {(
                (item.price - item.price * (item.discount / 100)) *
                item.quantity
              ).toLocaleString()}
              원
            </span>
          </div>
        ))}
        {!showMore && items.length > 1 && (
          <Button
            variant="ghost"
            className="text-muted-foreground w-full text-sm"
            onClick={() => setShowMore(true)}
          >
            더보기 ({items.length - 1}개)
          </Button>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
