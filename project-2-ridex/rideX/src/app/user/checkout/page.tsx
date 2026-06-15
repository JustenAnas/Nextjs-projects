import React, { Suspense } from "react";
import Checkout from "@/components/Checkout";

function Page() {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      <Checkout />
    </Suspense>
  );
}

export default Page;
