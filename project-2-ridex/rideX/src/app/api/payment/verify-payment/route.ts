import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Booking from "@/models/booking.model";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const {
      bookingId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = await req.json();
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({
        success: false,
        message: "Invalid Signature",
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({
        success: false,
        message: "booking not found",
      });
    }

    const adminCommission = booking.fare * 0.1;
    const partnerAmount = booking.fare - booking.adminCommission;
    booking.adminCommission = adminCommission;
    booking.partnerAmount = partnerAmount;
    booking.paymentStatus = "paid";
    booking.bookingStatus = "confirmed";
    await booking.save();

    return NextResponse.json(
      {
        success: true,
        adminCommission,
        partnerAmount,
        message: "Payment verified successfully",
      },
      {
        status: 200,
      }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: `payment verification failed ${err}`,
      },
      {
        status: 500,
      }
    );
  }
}
