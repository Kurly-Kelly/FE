"use client";

import { Header } from "@/components/layout/header";
import { PageLayout } from "@/components/layout/pagelayout";
import { ResetPasswordSuccess } from "@/feature/reset-password/reset-password-success";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <PageLayout>
      <Header
        title="비밀번호 재설정"
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
      <ResetPasswordSuccess />
    </PageLayout>
  );
}
