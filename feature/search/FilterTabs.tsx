// "use client";

// import { ChevronDown, ChevronUp } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
//   SheetClose,
// } from "@/components/ui/sheet";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Checkbox } from "@/components/ui/checkbox";
// import type { FilterCategory } from "@/feature/search/filter";
// import { categories } from "@/feature/category/category-list";
// import { useState } from "react";

// /**
//  * 우리가 관리해야 할 필터 상태:
//  *  - selectedMainCategories : string[]
//  *  - selectedSubCategories  : string[]
//  *  - selectedDeliveries     : string[]
//  *  - 그 외 가격, 할인율 등
//  *
//  * 필터 UI는 "카테고리/가격/할인율/배송" 4개 탭으로 구성.
//  * 필요한 props로 위 배열들을 주고받음.
//  */
// interface FilterTabsProps {
//   filterOptions: FilterCategory; // { 카테고리, 가격, 할인율, 배송 등 }

//   // "메인카테고리" 체크된 항목들
//   selectedMainCategories: string[];
//   setSelectedMainCategories: (vals: string[]) => void;

//   // "서브카테고리" 체크된 항목들
//   selectedSubCategories: string[];
//   setSelectedSubCategories: (vals: string[]) => void;

//   // "배송" 체크된 항목들
//   selectedDeliveries: string[];
//   setSelectedDeliveries: (vals: string[]) => void;

//   //   // "가격" 체크된 항목들
//   //   selectedPrices: string[];
//   //   setSelectedPrices: (vals: string[]) => void;

//   //   // "할인율" 체크된 항목들
//   //   selectedDiscounts: string[];
//   //   setSelectedDiscounts: (vals: string[]) => void;

//   onApplyFilters: () => void; // "적용" 버튼 클릭 시 호출
//   onResetFilters: () => void; // "초기화" 버튼 클릭 시 호출
//   totalFilteredCount: number; // 필터링된 상품 개수
// }

// /**
//  * 기존 UI(탭/시트/체크박스 레이아웃)는 변경 없이,
//  * 체크박스 클릭 시 'handleCheckMainCategory', 'handleCheckSubCategory', 'handleCheckDelivery' 등으로 배열 업데이트
//  */
// export function FilterTabs({
//   filterOptions,
//   selectedMainCategories,
//   setSelectedMainCategories,
//   selectedSubCategories,
//   setSelectedSubCategories,
//   selectedDeliveries,
//   setSelectedDeliveries,
//   //   selectedPrices,
//   //   setSelectedPrices,
//   //   selectedDiscounts,
//   //   setSelectedDiscounts,
//   onApplyFilters,
//   onResetFilters,
//   totalFilteredCount,
// }: FilterTabsProps) {
//   const [activeTab, setActiveTab] = useState<keyof FilterCategory | "카테고리">(
//     "카테고리"
//   );
//   const [expandedId, setExpandedId] = useState<number | null>(null);

//   // 메인카테고리 체크
//   const handleCheckMainCat = (cat: string, checked: boolean) => {
//     const newArr = checked
//       ? [...selectedMainCategories, cat]
//       : selectedMainCategories.filter((c) => c !== cat);
//     setSelectedMainCategories(newArr);
//   };

//   // 서브카테고리 체크
//   const handleCheckSubCat = (subCat: string, checked: boolean) => {
//     const newArr = checked
//       ? [...selectedSubCategories, subCat]
//       : selectedSubCategories.filter((s) => s !== subCat);
//     setSelectedSubCategories(newArr);
//   };

//   // 배송 체크
//   const handleCheckDelivery = (del: string, checked: boolean) => {
//     const newArr = checked
//       ? [...selectedDeliveries, del]
//       : selectedDeliveries.filter((d) => d !== del);
//     setSelectedDeliveries(newArr);
//   };

//   //   // 가격 체크
//   //   const handleCheckPrice = (price: string, checked: boolean) => {
//   //     const newArr = checked
//   //       ? [...selectedPrices, price]
//   //       : selectedPrices.filter((p) => p !== price);
//   //     setSelectedPrices(newArr);
//   //   };

//   //   // 할인율 체크
//   //   const handleCheckDiscount = (discount: string, checked: boolean) => {
//   //     const newArr = checked
//   //       ? [...selectedDiscounts, discount]
//   //       : selectedDiscounts.filter((d) => d !== discount);
//   //     setSelectedDiscounts(newArr);
//   //   };
//   //   const totalSelectedFilters =
//   //     selectedMainCategories.length +
//   //     selectedSubCategories.length +
//   //     selectedDeliveries.length;

//   //   // 총 선택된 필터 개수 (카테고리, 서브카테고리, 배송, 가격, 할인율)
//   //   const totalSelectedFilters =
//   //     selectedMainCategories.length +
//   //     selectedSubCategories.length +
//   //     selectedDeliveries.length +
//   //     selectedPrices.length +
//   //     selectedDiscounts.length;

//   return (
//     <div className="border-b">
//       <div className="overflow-x-auto whitespace-nowrap pb-1">
//         <div className="inline-flex gap-2 p-3">
//           {/* (기존) Sheet(모달) 트리거 : 카테고리, 가격, 할인율, 배송 */}
//           {["카테고리", "가격", "할인율", "배송"].map((filterKey) => (
//             <Sheet key={filterKey}>
//               <SheetTrigger asChild>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="h-8 rounded-full text-sm font-normal"
//                   onClick={() =>
//                     setActiveTab(filterKey as keyof FilterCategory)
//                   }
//                 >
//                   {filterKey} <ChevronDown className="ml-1 h-4 w-4" />
//                 </Button>
//               </SheetTrigger>

//               <SheetContent
//                 side="bottom"
//                 className="mx-auto h-[60vh] w-full max-w-[360px] flex flex-col p-0 sm:max-w-[360px]"
//                 aria-describedby="filter-description"
//               >
//                 <p id="filter-description" className="sr-only">
//                   선택한 필터에 따라 결과를 필터링합니다.
//                 </p>
//                 <div className="flex h-full flex-col">
//                   <SheetHeader className="border-b px-4 py-3">
//                     <SheetTitle className="text-lg font-medium">
//                       필터
//                     </SheetTitle>
//                   </SheetHeader>

//                   <Tabs value={activeTab} className="flex flex-col h-full">
//                     <ScrollArea className="border-b">
//                       <TabsList className="h-auto w-full justify-start rounded-none border-0 bg-transparent p-0">
//                         {["카테고리", "가격", "할인율", "배송"].map((tab) => (
//                           <TabsTrigger
//                             key={tab}
//                             value={tab}
//                             className="flex-1 rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-normal data-[state=active]:border-primary data-[state=active]:bg-transparent"
//                             onClick={() =>
//                               setActiveTab(tab as keyof FilterCategory)
//                             }
//                           >
//                             {tab}
//                           </TabsTrigger>
//                         ))}
//                       </TabsList>
//                     </ScrollArea>

//                     {/* 카테고리 탭 */}
//                     <ScrollArea className="flex-1 px-4 overflow-y-auto">
//                       <TabsContent value="카테고리" className="m-0 py-4">
//                         <div className="space-y-4">
//                           {/** (기존) 상위 카테고리 리스트 */}
//                           {categories.map((cat) => (
//                             <div key={cat.id} className="border-b pb-2">
//                               {/* 메인 카테고리 라벨 + 펼침/접힘 아이콘 */}
//                               <div className="flex items-center justify-between">
//                                 <span className="flex-1 text-sm">
//                                   {cat.name}
//                                 </span>
//                                 {/* 펼침/접힘 토글 버튼 */}
//                                 {cat.subCategories &&
//                                   cat.subCategories.length > 0 && (
//                                     <button
//                                       onClick={() =>
//                                         setExpandedId(
//                                           expandedId === cat.id ? null : cat.id
//                                         )
//                                       }
//                                     >
//                                       {expandedId === cat.id ? (
//                                         <ChevronUp className="h-5 w-5 text-gray-500" />
//                                       ) : (
//                                         <ChevronDown className="h-5 w-5 text-gray-500" />
//                                       )}
//                                     </button>
//                                   )}
//                               </div>

//                               {/* 서브카테고리 (접힘/펼침) */}
//                               {expandedId === cat.id && cat.subCategories && (
//                                 <div className="mt-2 ml-6 flex flex-col space-y-1">
//                                   {cat.subCategories.map((sub, idx) => (
//                                     <label
//                                       key={idx}
//                                       className="flex cursor-pointer items-center gap-3"
//                                     >
//                                       <Checkbox
//                                         checked={selectedSubCategories.includes(
//                                           sub
//                                         )}
//                                         onCheckedChange={(checked) => {
//                                           if (sub === "전체보기") {
//                                             if (checked) {
//                                               // "전체보기" 선택 시 해당 메인카테고리의 모든 서브카테고리 선택
//                                               const newSubs = Array.from(
//                                                 new Set([
//                                                   ...selectedSubCategories,
//                                                   ...cat.subCategories,
//                                                 ])
//                                               );
//                                               setSelectedSubCategories(newSubs);
//                                             } else {
//                                               // "전체보기" 선택 해제 시 해당 메인카테고리의 모든 서브카테고리 제거
//                                               const newSubs =
//                                                 selectedSubCategories.filter(
//                                                   (s) =>
//                                                     !cat.subCategories.includes(
//                                                       s
//                                                     )
//                                                 );
//                                               setSelectedSubCategories(newSubs);
//                                             }
//                                           } else {
//                                             // "전체보기" 체크박스 해제 및 현재 서브카테고리 상태 업데이트 통합
//                                             setSelectedSubCategories(
//                                               (prevSubs) => {
//                                                 let newSubs = [...prevSubs]; // 이전 상태 복사

//                                                 // 현재 체크 해제 시 "전체보기" 포함 여부 확인 후 해제
//                                                 if (
//                                                   !checked &&
//                                                   newSubs.includes("전체보기")
//                                                 ) {
//                                                   newSubs = newSubs.filter(
//                                                     (s) => s !== "전체보기"
//                                                   );
//                                                 }

//                                                 // 현재 서브카테고리 업데이트
//                                                 if (checked) {
//                                                   if (!newSubs.includes(sub)) {
//                                                     newSubs.push(sub);
//                                                   }
//                                                 } else {
//                                                   newSubs = newSubs.filter(
//                                                     (s) => s !== sub
//                                                   );
//                                                 }
//                                                 return newSubs;
//                                               }
//                                             );
//                                           }
//                                         }}
//                                       />

//                                       <span className="flex-1 text-sm">
//                                         {sub}
//                                       </span>
//                                     </label>
//                                   ))}
//                                 </div>
//                               )}
//                             </div>
//                           ))}
//                         </div>
//                       </TabsContent>

//                       {/* 가격 탭 */}
//                       <TabsContent value="가격" className="m-0 py-4">
//                         <div className="space-y-4">
//                           {filterOptions.가격?.map((item) => (
//                             <label
//                               key={item}
//                               className="flex cursor-pointer items-center gap-3"
//                             >
//                               {/* <Checkbox
//                                 checked={selectedPrices.includes(item)}
//                                 onCheckedChange={(checked) =>
//                                   handleCheckPrice(item, Boolean(checked))
//                                 }
//                               /> */}
//                               <Checkbox
//                                 checked={false /* TODO: handleCheckPrice */}
//                                 onCheckedChange={(checked) => {
//                                   // 여기서 priceMin/priceMax 세팅 or
//                                   // 배열에 넣어도 됨
//                                   console.log("체크된 가격 필터:", item);
//                                 }}
//                               />
//                               <span className="flex-1 text-sm">{item}</span>
//                             </label>
//                           ))}
//                         </div>
//                       </TabsContent>

//                       {/* 할인율 탭 */}
//                       <TabsContent value="할인율" className="m-0 py-4">
//                         <div className="space-y-4">
//                           {filterOptions.할인율?.map((item) => (
//                             <label
//                               key={item}
//                               className="flex cursor-pointer items-center gap-3"
//                             >
//                               {/* <Checkbox
//                                 checked={selectedDiscounts.includes(item)}
//                                 onCheckedChange={(checked) =>
//                                   handleCheckDiscount(item, Boolean(checked))
//                                 }
//                               /> */}
//                               <Checkbox
//                                 checked={false /* TODO: handleCheckDiscount */}
//                                 onCheckedChange={(checked) => {
//                                   console.log("체크된 할인율:", item);
//                                 }}
//                               />
//                               <span className="flex-1 text-sm">{item}</span>
//                             </label>
//                           ))}
//                         </div>
//                       </TabsContent>

//                       {/* 배송 탭 */}
//                       <TabsContent value="배송" className="m-0 py-4">
//                         <div className="space-y-4">
//                           {filterOptions.배송?.map((item) => (
//                             <label
//                               key={item}
//                               className="flex cursor-pointer items-center gap-3"
//                             >
//                               <Checkbox
//                                 // 배송배열 체크
//                                 checked={selectedDeliveries.includes(item)}
//                                 onCheckedChange={(checked) =>
//                                   handleCheckDelivery(item, Boolean(checked))
//                                 }
//                               />
//                               <span className="flex-1 text-sm">{item}</span>
//                             </label>
//                           ))}
//                         </div>
//                       </TabsContent>
//                     </ScrollArea>

//                     {/* 하단 "초기화" 및 "적용" 버튼 */}
//                     <div className="border-t p-4 sticky bottom-0 bg-white flex gap-2">
//                       <Button
//                         variant="outline"
//                         className="flex-1"
//                         size="lg"
//                         onClick={() => {
//                           onResetFilters();
//                         }}
//                       >
//                         초기화
//                       </Button>
//                       <SheetClose asChild>
//                         <Button
//                           className="flex-1 whitespace-nowrap"
//                           size="lg"
//                           onClick={onApplyFilters}
//                         >
//                           {`${totalFilteredCount}개의 상품 보기`}
//                         </Button>
//                       </SheetClose>
//                     </div>
//                   </Tabs>
//                 </div>
//               </SheetContent>
//             </Sheet>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
