import mongoose from "mongoose";

export type vehicleType =
  | "bike"
  | "motorcycle"
  | "car"
  | "bus"
  | "truck"
  | "other";

export interface IVehicle {
  owner: mongoose.Types.ObjectId;
  type: vehicleType;
  vehicleModel: string;
  licensePlate: string;
  imageUrl?: string;
  baseFare?: number;
  pricePerKm?: number;
  waitingCharge?: number;
  status: "approved" | "pending" | "rejected";
  rejectionReason?: string;
  isActive: boolean;
  createdAt: Date;
  upDatedAt: Date;
}

const vehicleSchema = new mongoose.Schema<IVehicle>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["bike", "motorcycle", "car", "bus", "truck", "other"],
      required: true,
    },
    vehicleModel: { type: String, required: true },
    licensePlate: { type: String, required: true, unique: true },
    imageUrl: { type: String },
    baseFare: { type: Number },
    pricePerKm: { type: Number },
    waitingCharge: { type: Number },
    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Vehicle =
  mongoose.models.Vehicle || mongoose.model<IVehicle>("Vehicle", vehicleSchema);

export default Vehicle;
