import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";

const VEHICLE_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;

export async function POST(req: NextRequest) {
 
  try {
    await connectDB();
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ message: "unauthorized" }, { status: 400 });
    }
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return Response.json({ message: "cant find user" }, { status: 400 });
    }
    const { type, vehicleModel, licensePlate } = await req.json();
    if (!type || !vehicleModel || !licensePlate) {
      return Response.json(
        { message: "missing required details" },
        { status: 400 }
      );
    }

    if (!VEHICLE_REGEX.test(licensePlate)) {
      return Response.json(
        { message: "Invalid vehcile number format" },
        { status: 400 }
      );
    }
    const vehicleNumber = licensePlate.toUpperCase();

    let vehicle = await Vehicle.findOne({ owner: user._id });
    if (vehicle) {
      vehicle.type = type;
      vehicle.licensePlate = vehicleNumber;
      vehicle.vehicleModel = vehicleModel;
      vehicle.status = "pending";
      await vehicle.save();
      if (user.partnerOnBoardingSteps < 2) {
        user.partnerOnBoardingSteps = 2;
        user.partnerStatus = "pending";
        await user.save();
      } else {
        user.partnerOnBoardingSteps = 3;
        user.partnerStatus = "pending";
        await user.save();
      }

      return Response.json(vehicle, { status: 200 });
    }
    const duplicate = await Vehicle.findOne({ licensePlate: vehicleNumber });
    if (duplicate) {
      return Response.json(
        { message: "Vehcile Already Registered!!" },
        { status: 400 }
      );
    }

    vehicle = await Vehicle.create({
      owner: user._id,
      type,
      licensePlate: vehicleNumber,
      vehicleModel,
    });

    if (user.partnerOnBoardingSteps < 1) {
      user.partnerOnBoardingSteps = 1;
    }

    user.role = "partner";
    user.partnerStatus = "pending";
    await user.save({ validateBeforeSave: false });
    return Response.json(vehicle, { status: 201 });
  } catch (error) {
    return Response.json(
      { message: `vehicle error ${error}` },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ message: "unauthorized" }, { status: 400 });
    }
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return Response.json({ message: "cant find user" }, { status: 400 });
    }

    const vehicle = await Vehicle.findOne({ owner: user._id });
    if (vehicle) {
      return Response.json(vehicle, { status: 201 });
    } else {
      return Response.json({ message: "Vehicle not found" }, { status: 404 });
    }
  } catch (error) {
    return Response.json(
      { message: ` get vehicle error ${error}` },
      { status: 500 }
    );
  }
}
