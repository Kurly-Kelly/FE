"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/feature/search/filter";

interface ProductFilterProps {
  results: Product[];
  totalItems: number;
}

export function ProductFilter({ results }: ProductFilterProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(results);

  useEffect(() => {
    setFilteredProducts(results);
  }, [results]);

  const calculateFinalPrice = (price: number, discount: number) => {
    const finalPrice = price - price * (discount / 100);
    return new Intl.NumberFormat().format(finalPrice);
  };

  const deliveryMapping: { [key: string]: string } = {
    GENERAL_DELIVERY: "일반배송",
    EARLY_DELIVERY: "새벽배송",
    SELLER_DELIVERY: "판매자직접배송",
  };

  const getDeliveryText = (delivery: string | string[]) => {
    const deliveryKey = Array.isArray(delivery) ? delivery[0] : delivery;
    return deliveryMapping[deliveryKey] || deliveryKey;
  };

  return (
    <div className="flex flex-col">
      {/* 상단 영역 */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="text-sm text-muted-foreground">
          총 {filteredProducts.length}개
        </div>
        <Button variant="ghost" size="sm" className="text-sm font-normal">
          추천순 <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {/* 상품 리스트 */}
      <div className="flex-1">
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 gap-4 p-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Link key={product.id} href={`/productDetail/${product.id}`}>
                  <div className="relative flex flex-col rounded-none bg-white p-2 shadow-sm">
                    <div className="relative w-[140px] h-[120px]">
                      <Image
                        src={product.imageUrls[0] || "/placeholder.svg"}
                        alt={product.name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute bottom-2 right-2 size-8"
                      >
                        <ShoppingCart className="size-4" />
                      </Button>
                    </div>
                    <p className="mb-1 text-xs text-gray-500">
                      {getDeliveryText(product.delivery)}
                    </p>
                    <h3 className="mb-1 line-clamp-1 text-sm font-medium text-gray-800">
                      {product.name}
                    </h3>
                    <div className="mb-1 flex items-center">
                      {product.discount !== null &&
                      product.discount !== undefined ? (
                        <>
                          <span className="mr-1 text-base font-bold text-rose-500">
                            {product.discount}%
                          </span>
                          <span className="text-base font-bold">
                            {calculateFinalPrice(
                              product.price,
                              product.discount
                            )}
                            원
                          </span>
                        </>
                      ) : (
                        <span className="text-base font-bold">
                          {product.price.toLocaleString()}원
                        </span>
                      )}
                    </div>
                    {product.discount !== null &&
                      product.discount !== undefined && (
                        <p className="text-xs text-gray-400 line-through">
                          {product.price.toLocaleString()}원
                        </p>
                      )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                검색된 상품이 없습니다.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
