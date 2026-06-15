import { auth } from "@/auth";
import connectDB from "@/lib/db";
import PartnerBank from "@/models/partnerBank.model";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { rejectionReason } = await req.json();
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
      return Response.json(
        {
          message: "partner not found",
        },
        { status: 400 }
      );
    }

    partner.partnerStatus = "rejected";
    partner.rejectionReason = rejectionReason;
    await partner.save();

    return Response.json(
      { message: "partner rejected successfully" },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { message: `partner rejected error ${error}` },
      { status: 500 }
    );
  }
}
