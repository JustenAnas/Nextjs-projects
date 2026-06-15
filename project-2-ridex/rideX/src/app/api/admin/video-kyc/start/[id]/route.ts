import { auth } from "@/auth";
import connectDB from "@/lib/db";
import PartnerBank from "@/models/partnerBank.model";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await auth();

    if (!session || !session.user?.email) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }

    const partnerId = (await context.params).id;

    const partner = await User.findById(partnerId);

    if (!partner || partner.role !== "partner") {
      return Response.json({ message: "partner not found" }, { status: 400 });
    }

    // If video KYC is already in progress, return existing room
    if (partner.videoKycStatus === "in_progress" && partner.videoKycRoomId) {
      return NextResponse.json(
        {
          message: "Video KYC already started",
          roomId: partner.videoKycRoomId,
        },
        { status: 200 }
      );
    }

    const partnerDocs = await PartnerDocs.findOne({
      owner: partner._id,
    });

    const partnerBank = await PartnerBank.findOne({
      owner: partner._id,
    });

    if (!partnerDocs || !partnerBank) {
      return Response.json(
        { message: "partner didnt complete on boarding steps" },
        { status: 400 }
      );
    }

    const roomId = `kyc-${partner._id}_${Date.now()}`;

    // Do NOT set partnerStatus = "approved" here.
    // Approval should happen only after successful video KYC.
    partner.videoKycRoomId = roomId;
    partner.videoKycStatus = "in_progress";
    partner.partnerOnBoardingSteps = 4;

    await partner.save();

    return NextResponse.json(
      {
        message: "Video KYC started successfully",
        roomId,
      },
      { status: 200 }
    );
  } catch (err) {
    return Response.json(
      {
        message: `video kyc start error ${err}`,
      },
      { status: 500 }
    );
  }
}
