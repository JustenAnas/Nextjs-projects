import { auth } from "@/auth";
import uploadOnCloudniary from "@/lib/cloudinary";
import connectDB from "@/lib/db";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ message: "unauthorized" }, { status: 401 });
    }
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return Response.json({ message: "cant find user" }, { status: 404 });
    }

    const formData = await req.formData();
    const aadhar = formData.get("aadhar") as Blob | null;
    const pancard = formData.get("pancard") as Blob | null;
    const license = formData.get("license") as Blob | null;
    const rc = formData.get("rc") as Blob | null;

    const existingDocs = await PartnerDocs.findOne({ owner: user._id });

    // only require docs that aren't already uploaded
    if (!aadhar && !existingDocs?.aadharCard)
      return Response.json({ message: "Aadhaar is required" }, { status: 400 });
    if (!pancard && !existingDocs?.panCard)
      return Response.json({ message: "Pancard is required" }, { status: 400 });
    if (!license && !existingDocs?.drivingLicense)
      return Response.json({ message: "License is required" }, { status: 400 });
    if (!rc && !existingDocs?.rcUrl)
      return Response.json({ message: "RC is required" }, { status: 400 });

    const updatePayload: any = { status: "pending" };

    if (aadhar) {
      const url = await uploadOnCloudniary(aadhar);
      if (!url)
        return Response.json(
          { message: "Aadhaar upload failed" },
          { status: 500 }
        );
      updatePayload.aadharCard = url;
    }
    if (pancard) {
      const url = await uploadOnCloudniary(pancard);
      if (!url)
        return Response.json(
          { message: "Pancard upload failed" },
          { status: 500 }
        );
      updatePayload.panCard = url;
    }
    if (license) {
      const url = await uploadOnCloudniary(license);
      if (!url)
        return Response.json(
          { message: "License upload failed" },
          { status: 500 }
        );
      updatePayload.drivingLicense = url;
    }
    if (rc) {
      const url = await uploadOnCloudniary(rc);
      if (!url)
        return Response.json({ message: "RC upload failed" }, { status: 500 });
      updatePayload.rcUrl = url;
    }

    const partnerDocs = await PartnerDocs.findOneAndUpdate(
      { owner: user._id },
      { $set: updatePayload },
      { upsert: true, new: true }
    );

    if (user.partnerOnBoardingSteps < 2) {
      user.partnerOnBoardingSteps = 2;
    } else {
      user.partnerOnBoardingSteps = 3;
    }

    user.partnerStatus = "pending";
    await user.save({ validateBeforeSave: false }); // ← fixed missing ()

    return Response.json(partnerDocs, { status: 201 });
  } catch (error) {
    console.error("FULL ERROR:", error);
    return Response.json(
      {
        message: `partner docs error ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ message: "unauthorized" }, { status: 401 });
    }
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return Response.json({ message: "cant find user" }, { status: 404 });
    }

    const partnerDocs = await PartnerDocs.findOne({ owner: user._id });
    if (!partnerDocs) {
      return Response.json({ message: "no docs found" }, { status: 404 });
    }

    // return with same keys the frontend checks
    return Response.json(
      {
        aadhar: partnerDocs.aadharCard,
        pancard: partnerDocs.panCard,
        license: partnerDocs.drivingLicense,
        rc: partnerDocs.rcUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { message: `get docs error ${error}` },
      { status: 500 }
    );
  }
}
