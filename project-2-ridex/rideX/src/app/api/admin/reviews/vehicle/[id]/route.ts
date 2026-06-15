import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";

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
    return Response.json(vehicle, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        message: `vehicle preview get error ${error}`,
      },
      { status: 500 }
    );
  }
}
