import connectDB from "@/lib/db";
import { sendCustomEmail } from "@/lib/sendMail";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { bookingId, otp } = await req.json();
    const booking = await Booking.findById(bookingId).populate("user");

    if (!booking) {
      return NextResponse.json(
        {
          message: "booking not found",
        },
        { status: 400 }
      );
    }

    // 1. Check if the OTP was ever generated
    if (!booking.dropOtp) {
      return NextResponse.json(
        {
          message: "drop otp not generated",
        },
        { status: 400 }
      );
    }

    // 2. Check if the provided OTP matches the database OTP
    if (booking.dropOtp !== otp) {
      return NextResponse.json(
        {
          message: "incorrect drop otp ",
        },
        { status: 400 }
      );
    }

    // 3. FIX: Check the expiry date field, not the OTP string field
    if (booking.dropOtpExpires && booking.dropOtpExpires < new Date()) {
      return NextResponse.json(
        {
          message: "otp expires",
        },
        { status: 400 }
      );
    }

    if (booking.paymentStatus === "cash") {
      const adminCommission = booking.fare * 0.1;
      const partnerAmount = booking.fare - booking.adminCommission;
      booking.adminCommission = adminCommission;
      booking.partnerAmount = partnerAmount;
    }

    booking.paymentStatus = "paid";
    // 4. Update the booking records upon successful validation
    booking.bookingStatus = "completed";
    booking.dropOtp = "";
    booking.dropOtpExpires = undefined;
    await booking.save();

    return NextResponse.json(
      {
        message: "drop otp verified",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: `drop otp verified error ${error}`,
      },
      { status: 500 }
    );
  }
}
