import connectDB from "@/lib/db";
import User from "@/models/user.model";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, otp } = await req.json();

    if (!email || !otp || otp.length !== 6) {
      return Response.json(
        { message: "Email and OTP are required" },
        { status: 400 }
      );
    }
    const user = await User.findOne({ email });

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }
    if (user.isEmailVerified) {
      return Response.json(
        { message: "Email already verified" },
        { status: 404 }
      );
    }
    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      user.otp = undefined;
      user.otpExpiresAt = undefined;
      await user.save({ validateBeforeSave: false });
      return Response.json({ message: "OTP has expired" }, { status: 400 });
    }
    if (!user.otp || user.otp !== otp) {
      return Response.json({ message: "Invalid OTP" }, { status: 400 });
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();
    return Response.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { message: `An error occurred while verifying email: ${error}` },
      { status: 500 }
    );
  }
}
