"use client";

import { useState, useEffect } from "react";
import { SearchIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  searchProducts,
  getSuggestions,
  getAllProducts,
  Product,
  fetchFilteredProducts,
} from "./search-api";

export default function SearchFeature() {
  const [searchValue, setSearchValue] = useState(""); // 검색어
  const [suggestions, setSuggestions] = useState<string[]>([]); // 자동완성 추천어
  const [showResults, setShowResults] = useState(false); // 결과 화면 표시 여부
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // 추천 검색어 & 급상승 검색어를 위한 state
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);

  // 자동완성
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchValue.trim() === "") {
        setSuggestions([]);
        return;
      }
      setLoadingSuggestions(true);
      try {
        const suggestionsData = await getSuggestions(searchValue);
        setSuggestions(suggestionsData);
      } catch (error) {
        console.error("자동완성 오류:", error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    // 디바운싱
    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchValue]);

  // 추천 상품 & 급상승 상품 로딩
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await getAllProducts();
        // 랜덤 5개, 10개 등 뽑아서 저장
        setRecommendedProducts(getRandomItems(allProducts, 5));
        setTrendingProducts(getRandomItems(allProducts, 10));
      } catch (error) {
        console.error("상품 데이터 로드 오류:", error);
      }
    };

    fetchProducts();
  }, []);

  const getRandomItems = <T,>(array: T[], count: number): T[] => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // 검색 버튼 or 추천어 클릭 시 호출
  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchValue.trim() === "") return;

    try {
      const products = await searchProducts(searchValue);
      console.log("검색 API 응답:", products);
      setSearchResults(products);
      setShowResults(true);
    } catch (error) {
      console.error("검색 오류:", error);
    }
  };

  const handleKeywordClick = async (keyword: string) => {
    setSearchValue(keyword);
    try {
      const products = await searchProducts(keyword);
      setSearchResults(products);
      setShowResults(true);
    } catch (error) {
      console.error("검색 오류:", error);
    }
  };

  // 검색어 초기화
  const clearSearch = () => {
    setSearchValue("");
    setSuggestions([]);
    setShowResults(false);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-[360px] bg-white">
      {/* 검색 입력 필드 */}
      <div className="p-4 bg-white">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <SearchIcon className="absolute left-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="검색어를 입력해 주세요"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 pr-8 bg-gray-50"
          />
          {searchValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 h-full"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </form>
      </div>

      {/* 자동완성 추천어 */}
      {!showResults && suggestions.length > 0 && (
        <ScrollArea className="flex-grow">
          <div className="p-4 space-y-4">
            {loadingSuggestions && (
              <div className="text-sm text-gray-500">로딩 중...</div>
            )}
            {!loadingSuggestions &&
              suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer p-2 rounded-md hover:bg-gray-100"
                  onClick={() => handleKeywordClick(suggestion)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleKeywordClick(suggestion);
                    }
                  }}
                >
                  {suggestion}
                </div>
              ))}
          </div>
        </ScrollArea>
      )}

      {/* 검색 결과 표시 부분 수정 */}
      {showResults && (
        <ScrollArea className="flex-grow">
          <div className="p-4">
            <h2 className="font-medium mb-3">검색 결과</h2>
            <div className="space-y-2">
              {searchResults.length === 0 ? (
                <div className="text-sm text-gray-500">
                  검색 결과가 없습니다.
                </div>
              ) : (
                searchResults.map((product) => (
                  <div
                    key={product.id}
                    className="p-2 rounded-md hover:bg-gray-100"
                  >
                    <span>{product.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </ScrollArea>
      )}

      {/* 검색 전 or 자동완성 이외 상태 - 추천/급상승  */}
      {!showResults && suggestions.length === 0 && (
        <ScrollArea className="flex-grow">
          <div className="p-4">
            <h2 className="font-medium mb-3">추천 상품</h2>
            <div className="flex flex-wrap gap-2">
              {recommendedProducts.length === 0 ? (
                <div className="text-sm text-gray-500">
                  추천 상품 로딩 중...
                </div>
              ) : (
                recommendedProducts.map((product) => (
                  <Badge
                    key={product.id}
                    variant="secondary"
                    className="px-3 py-1 rounded-full cursor-pointer bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    onClick={() => handleKeywordClick(product.name)}
                  >
                    {product.name}
                  </Badge>
                ))
              )}
            </div>
          </div>

          <div className="p-4">
            <h2 className="font-medium mb-3">급상승 상품</h2>
            <div className="space-y-2">
              {trendingProducts.length === 0 ? (
                <div className="text-sm text-gray-500">
                  급상승 상품 로딩 중...
                </div>
              ) : (
                trendingProducts.map((product, index) => (
                  <div
                    key={product.id}
                    role="button"
                    tabIndex={0}
                    className="flex items-center gap-4 cursor-pointer p-2 rounded-md hover:bg-gray-100"
                    onClick={() => handleKeywordClick(product.name)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleKeywordClick(product.name);
                      }
                    }}
                  >
                    <span className="text-emerald-500 font-medium">
                      {index + 1}
                    </span>
                    <span>{product.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
