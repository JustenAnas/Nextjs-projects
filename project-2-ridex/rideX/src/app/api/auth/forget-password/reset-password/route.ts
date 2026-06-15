import connectDB from "@/lib/db";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();

    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // check if OTP verification happened
    if (!user.resetVerified) {
      return NextResponse.json(
        { message: "OTP not verified" },
        { status: 403 }
      );
    }

    // password validation (basic)
    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password too short" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    // cleanup reset state
    user.resetVerified = false;

    await user.save({ validateBeforeSave: false });

    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
