"use client";

import dynamic from "next/dynamic";

const DynamicFailPage = dynamic(() => import("./FailPage"), {
  ssr: false,
});

export default DynamicFailPage;
