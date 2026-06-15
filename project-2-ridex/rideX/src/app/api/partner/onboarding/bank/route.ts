import { auth } from "@/auth";
import connectDB from "@/lib/db";
import PartnerBank from "@/models/partnerBank.model";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    const { accountHolderName, accountNumber, ifscCode, upi, mobileNumber } =
      await req.json();

    if (!accountHolderName || !accountNumber || !ifscCode || !mobileNumber) {
      return Response.json(
        { message: "All bank details are required" },
        { status: 400 }
      );
    }
    // Account number: 9-18 digits
    const ACCOUNT_REGEX = /^\d{9,18}$/;
    if (!ACCOUNT_REGEX.test(accountNumber)) {
      return Response.json(
        { message: "Invalid account number" },
        { status: 400 }
      );
    }

    // IFSC: 4 letters + 0 + 6 alphanumeric e.g. SBIN0001234
    const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!IFSC_REGEX.test(ifscCode.toUpperCase())) {
      return Response.json(
        { message: "Invalid IFSC code e.g. SBIN0001234" },
        { status: 400 }
      );
    }

    // Mobile: 10 digits starting with 6-9
    const MOBILE_REGEX = /^[6-9]\d{9}$/;
    if (!MOBILE_REGEX.test(mobileNumber)) {
      return Response.json(
        { message: "Invalid mobile number" },
        { status: 400 }
      );
    }

    // UPI: anything@anything
    const UPI_REGEX = /^[\w.\-]{3,}@[a-zA-Z]{3,}$/;
    if (upi && !UPI_REGEX.test(upi)) {
      return Response.json(
        { message: "Invalid UPI ID e.g. name@upi" },
        { status: 400 }
      );
    }
    if (!UPI_REGEX.test(upi)) {
      return Response.json(
        { message: "Invalid UPI ID e.g. name@upi" },
        { status: 400 }
      );
    }

    const partnerBank = await PartnerBank.findOneAndUpdate(
      { owner: user._id },
      {
        $set: {
          accountHolderName,
          accountNumber,
          ifscCode,
          upi,
          status: "added",
        },
      },
      { upsert: true, new: true }
    );

    user.mobileNumber = mobileNumber;

    if (user.partnerOnBoardingSteps < 3) {
      user.partnerOnBoardingSteps = 3;
    }
    user.partnerStatus = "pending";

    await user.save({ validateBeforeSave: false });

    return Response.json(partnerBank, { status: 201 });
  } catch (error) {
    return Response.json(
      { message: `Partner bank error: ${error}` },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    const partnerBank = await PartnerBank.findOne({ owner: user._id });
    if (!partnerBank) {
      return Response.json(
        { message: "No bank details found" },
        { status: 404 }
      );
    }

    return Response.json(
      { partnerBank, mobileNumber: user?.mobileNumber },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { message: `Partner bank error: ${error}` },
      { status: 500 }
    );
  }
}
