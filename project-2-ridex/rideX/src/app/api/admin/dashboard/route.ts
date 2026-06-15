import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    if (!session || !session.user?.email || session.user.role !== "admin") {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
    const totalPartners = await User.countDocuments({ role: "partner" });
    const totalApprovedPartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "approved",
    });
    const totalPendingPartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "pending",
    });
    const totalRejectedPartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "rejected",
    });

    const pendingPartnerUser = await User.find({
      role: "partner",
      partnerStatus: "pending",
      videoKycStatus: "not_required",
      partnerOnBoardingSteps: { $gte: 3 },
    });
    const partnerIds = pendingPartnerUser.map((p) => p._id);
    const partnerVehicles = await Vehicle.find({
      owner: { $in: partnerIds },
    });
    const vehicleTypeMap = new Map(
      partnerVehicles.map((v) => [String(v.owner), v.type])
    );
    const pendingPartnerReviews = pendingPartnerUser.map((p) => ({
      _id: p._id,
      name: p.username,
      email: p.email,
      vehicleType: vehicleTypeMap.get(String(p._id)),
    }));

    const pendingVehicles = await Vehicle.find({
      status: "pending",
      baseFare: { $exists: true },
    }).populate("owner");

    return NextResponse.json(
      {
        pendingVehicles,
        stats: {
          totalPartners,
          totalApprovedPartners,
          totalPendingPartners,
          totalRejectedPartners,
        },
        pendingPartnerReviews,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: `admin dashboard error ${error}`,
      },
      { status: 500 }
    );
  }
}
