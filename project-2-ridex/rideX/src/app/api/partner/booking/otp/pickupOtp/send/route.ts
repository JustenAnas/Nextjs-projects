import connectDB from "@/lib/db";
import { sendCustomEmail } from "@/lib/sendMail";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { bookingId } = await req.json();
    const booking = await Booking.findById(bookingId).populate("user");
    if (!booking) {
      return NextResponse.json(
        {
          message: "booking not found",
        },
        { status: 400 }
      );
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    booking.pickUpOtp = otp;
    const otpExpiresAt = new Date(Date.now() + 60000);
    booking.pickUpOtpExpires = otpExpiresAt;
    await booking.save();

    if (booking.user.email) {
      await sendCustomEmail(
        booking.user.email,
        "Your Pickup OTP - RideX",
        `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>rideX Pickup OTP</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;padding:30px;">
      
      <h1 style="margin:0;color:#111;">rideX</h1>

      <p style="margin-top:25px;color:#333;">
        Hello,
      </p>

      <p style="color:#333;">
        Your pickup verification OTP is:
      </p>

      <div style="
        text-align:center;
        font-size:36px;
        font-weight:bold;
        letter-spacing:8px;
        padding:20px;
        background:#f3f4f6;
        border-radius:10px;
        margin:20px 0;
      ">
        ${booking.pickUpOtp}
      </div>

      <p style="color:#333;">
        Share this OTP with your driver to start the ride.
      </p>

      <p style="color:#333;">
        This OTP will expire in 1 minute.
      </p>

      <p style="color:#e11d48;font-weight:600;">
        Do not share this OTP with anyone.
      </p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:25px 0;"/>

      <p style="font-size:12px;color:#666;">
        © 2026 rideX. All rights reserved.
      </p>

    </div>
  </body>
  </html>
  `
      );
    }
    return NextResponse.json(
      {
        message: "pick-up otp sent",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: `pick-up otp error ${error}`,
      },
      { status: 500 }
    );
  }
}
