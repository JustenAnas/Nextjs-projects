import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { reason } = await req.json();
    await connectDB();
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }
    const vehicleId = (await context.params).id;
    const vehicle = await Vehicle.findById(vehicleId).populate("owner");
    if (!vehicle) {
      return Response.json(
        {
          message: "vehhicle not found",
        },
        { status: 400 }
      );
    }
    vehicle.status = "rejected";
    vehicle.rejectionReason = reason;
    await vehicle.save();

    return Response.json(vehicle, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        message: `vehicle reject error ${error}`,
      },
      { status: 500 }
    );
  }
}
