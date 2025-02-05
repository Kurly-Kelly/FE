"use client";

import dynamic from "next/dynamic";

const DynamicProductListPage = dynamic(() => import("./ProductListPage"), {
  ssr: false,
});

export default DynamicProductListPage;
