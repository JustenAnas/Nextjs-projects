import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    if (!session || !session.user?.email || session.user.role !== "admin") {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
    const partner = await User.find({
      role: "partner",
      partnerOnBoardingSteps: 4,
      videoKycStatus: { $in: ["pending", "in_progress", "rejected"] },
    });
    return Response.json(partner, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: `partner kys error ${error}` },
      { status: 500 }
    );
  }
}
