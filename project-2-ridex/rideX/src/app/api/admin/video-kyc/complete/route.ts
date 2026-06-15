import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    if (!session || !session.user?.email || session.user.role !== "admin") {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { roomId, action, reason } = await req.json();
    if (!roomId) {
      return Response.json({ message: "room id is required" }, { status: 400 });
    }
    if (!["approved", "rejected"].includes(action)) {
      return Response.json({ message: "invalid action" }, { status: 400 });
    }
    const partner = await User.findOne({
      videoKycRoomId: roomId,
      role: "partner",
    });
    if (!partner) {
      return Response.json({ message: "partner not found" }, { status: 400 });
    }
    if (action === "approved") {
      partner.videoKycStatus = "approved";
      partner.videoKycRoomId = "approved";
      partner.videoKycRejectionReason = undefined;
      partner.partnerOnBoardingSteps = 5;
      partner.partnerStatus = "approved";
    }
    if (action === "rejected") {
      if (!reason) {
        return Response.json(
          { message: "response is required for rejection" },
          { status: 400 }
        );
      }
      partner.videoKycStatus = "rejected";
      partner.videoKycRoomId = "rejected";
      partner.videoKycRejectionReason = reason.trim();
      partner.partnerStatus = "rejected";
      partner.partnerOnBoardingSteps = 4;
    }
    await partner.save();
    return Response.json({ status: partner.videoKycStatus }, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: `kyc complete error ${error}` },
      { status: 500 }
    );
  }
}
