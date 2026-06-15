"use client"

import { useState } from "react"
import { createBooking } from "@/lib/action/booking.action"
import posthog from "posthog-js"

// Props: eventId (MongoDB ObjectId as string) and slug (for PostHog tracking + revalidation)
const BookEvents = ({ eventId, slug }: { eventId: string; slug: string }) => {

    const [email, setEmail] = useState("")
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Call the server action to create the booking in MongoDB
        const { success } = await createBooking({ eventId, slug, email })

        if (success) {
            setSubmitted(true)
            // Track successful booking in PostHog analytics
            posthog.capture("event_booked", { eventId, slug, email })
        } else {
            console.error("Booking creation failed")
            // Track failed booking in PostHog for debugging
            posthog.captureException("Booking creation failed")
        }
    }

    return (
        <div id="book-event">
            {submitted ? (
                // Success state — shown after booking is confirmed
                <div className="confirmation text-sm">
                    <h3>Thank you for booking!</h3>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button className="button-submitted" type="submit">
                        Book Now
                    </button>
                </form>
            )}
        </div>
    )
}

export default BookEvents