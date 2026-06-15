import { Suspense } from "react";
import SearchContent from "@/components/SearchContent";

function Page() {
  return (
    <Suspense
      fallback={
        <div className="text-center p-5">Loading search results...</div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

export default Page;
