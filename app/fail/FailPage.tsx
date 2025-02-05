"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Img from "@/public/img/failTossIcon.png";

export default function FailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 쿼리 파라미터에서 실패 코드와 메시지 추출
  const failCode = searchParams.get("code");
  const failMessage = searchParams.get("message");

  return (
    <div className="flex min-h-screen justify-center bg-gray-100 font-sans">
      <div className="mx-auto w-full max-w-[360px] bg-white p-4 shadow-lg">
        {/* 카드 형태의 상단 박스 */}
        <div className="rounded-lg border-gray-300 pt-36 text-center">
          <Image className="mx-auto mb-4 w-28" src={Img} alt={"fail"} />

          {/* 메시지 */}
          <h2 className="mb-4 text-xl font-extrabold text-red-600">
            결제를 완료하지 못했어요
          </h2>
          <p className="mb-6 font-semibold text-gray-600">
            결제 과정에서 오류가 발생했습니다.
          </p>

          {/* 실패 정보 박스 */}
          <div className="mb-4 rounded-md bg-red-50 p-4 text-left">
            {/* 에러 코드 */}
            <div className="flex justify-between">
              <span className="font-bold">오류코드</span>
              <span className="text-red-700">{failCode || "UNKNOWN"}</span>
            </div>

            {/* 에러 메시지 */}
            <div className="mt-2">
              <span className="font-bold">에러 메시지</span>
              <div className="mt-1 break-all text-sm text-red-700">
                {failMessage || "결제에 실패했습니다. 다시 시도해주세요."}
              </div>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-center gap-2">
            <Link href="/landing">
              <button className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
                메인화면
              </button>
            </Link>
            <button
              onClick={() => router.back()}
              className="rounded bg-blue-50 px-4 py-2 font-bold text-blue-700 hover:bg-blue-100"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
