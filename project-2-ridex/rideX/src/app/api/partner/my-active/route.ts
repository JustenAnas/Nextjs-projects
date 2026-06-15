import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ message: "unauthorized" }, { status: 400 });
    }
    const user = await User.findOne({ email: session.user.email });
    const booking = await Booking.findOne({
      driver: user._id,
      bookingStatus: { $in: ["confirmed", "started"] },
    }).populate("user vehicle driver");
    return Response.json(booking, { status: 200 });
  } catch (error) {
    console.error("get active ride partner error:", error);
    return Response.json(
      { message: `get active ride partner error ${error}` },
      { status: 500 }
    );
  }
}
