import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import Booking from "@/models/booking.model";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const bookingId = (await context.params).id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({
        success: false,
        message: "booking not found",
      });
    }
    booking.paymentStatus = "cash";
    booking.bookingStatus = "confirmed";
    await booking.save();

    return NextResponse.json(
      {
        success: true,
        message: "Payment verified successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Cash confirm error${error}`,
      },
      {
        status: 500,
      }
    );
  }
}
