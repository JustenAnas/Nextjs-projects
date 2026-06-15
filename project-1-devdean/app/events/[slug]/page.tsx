import { Suspense } from "react";
import EventDetails from "@/components/EventDetails";

// Dynamic route page for /events/[slug]
// Delegates all fetching and rendering to the EventDetails component
const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
    return (
        <main>
            {/* Suspense required because EventDetails is async and uses 'use cache' */}
            <Suspense fallback={<div>Loading...</div>}>
                <EventDetails params={params} />
            </Suspense>
        </main>
    )
}

export default EventDetailsPage