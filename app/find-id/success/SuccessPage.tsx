"use client";

import { Header } from "@/components/layout/header";
import { PageLayout } from "@/components/layout/pagelayout";
import { FindIdSuccess } from "@/feature/find-id/find-id-success";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function FindIdSuccessPage() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "unknown";

  return (
    <PageLayout>
      <Header
        title="아이디 찾기"
        showDivider={false}
        closeButton={
          <Link
            href="/login"
            className="absolute left-4 top-1/2 -translate-y-1/2"
          >
            <ChevronLeft className="size-6" />
          </Link>
        }
      />
      <FindIdSuccess username={username} />
    </PageLayout>
  );
}
