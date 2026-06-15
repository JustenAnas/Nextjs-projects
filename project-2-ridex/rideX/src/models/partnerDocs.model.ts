import mongoose from "mongoose";

export interface IPartnerDocs {
  owner: mongoose.Types.ObjectId;
  aadharCard: string;
  panCard: string;
  drivingLicense: string;
  rcUrl: string;
  status: "approved" | "pending" | "rejected";
  rejectionReason?: string;

  createdAt: Date;
  upDatedAt: Date;
}

const partnerDocsSchema = new mongoose.Schema<IPartnerDocs>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    aadharCard: { type: String, required: true },
    panCard: { type: String, required: true },
    drivingLicense: { type: String, required: true },
    rcUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

const PartnerDocs =
  mongoose.models.PartnerDocs ||
  mongoose.model<IPartnerDocs>("PartnerDocs", partnerDocsSchema);

export default PartnerDocs;
