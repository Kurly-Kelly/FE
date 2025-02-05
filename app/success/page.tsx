"use client";

import dynamic from "next/dynamic";

const DynamicSuccessPage = dynamic(() => import("./SuccessPage"), {
  ssr: false,
});

export default DynamicSuccessPage;
