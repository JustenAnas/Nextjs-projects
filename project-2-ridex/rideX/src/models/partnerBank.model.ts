import mongoose from "mongoose";

export interface IPartnerBank {
  owner: mongoose.Types.ObjectId;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  upi?: string;
  status: "not_added" | "added" | "verified" | "rejected";
  rejectionReason?: string;
  createdAt: Date;
  upDatedAt: Date;
}

const partnerBankSchema = new mongoose.Schema<IPartnerBank>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountHolderName: { type: String, required: true },
    accountNumber: { type: String, required: true, unique: true },
    ifscCode: { type: String, required: true, unique: true, uppercase: true },
    upi: { type: String },
    status: {
      type: String,
      enum: ["not_added", "added", "verified", "rejected"],
      default: "not_added",
    },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

const PartnerBank =
  mongoose.models.PartnerBank ||
  mongoose.model<IPartnerBank>("PartnerBank", partnerBankSchema);

export default PartnerBank;
