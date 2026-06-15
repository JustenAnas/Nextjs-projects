import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";

export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await auth();
    if (!session || !session.user) {
      return Response.json(
        {
          message: "User is not authenticated",
        },
        { status: 401 }
      );
    }
    const user = await User.findOne(
      { email: session.user.email },
      { password: 0, otp: 0, otpExpiresAt: 0 }
    );
    if (!user) {
      return Response.json(
        {
          message: "User not found!!",
        },
        { status: 404 }
      );
    }
    return Response.json(user, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        message: `Internal server error ${error}`,
      },
      { status: 500 }
    );
  }
}
