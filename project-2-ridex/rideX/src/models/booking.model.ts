import mongoose from "mongoose";
import "@/models/vehicle.model";

export type BookingStatus =
  | "idle"
  | "requested"
  | "searching"
  | "confirmed"
  | "driver_assigned"
  | "accepted"
  | "arriving"
  | "arrived"
  | "started"
  | "completed"
  | "awaiting_payment"
  | "cancelled"
  | "rejected"
  | "expired";

export type PaymentStatus = "pending" | "paid" | "cash" | "failed";

export interface IBooking {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  driver?: mongoose.Types.ObjectId;
  vehicle?: mongoose.Types.ObjectId;

  pickUpAddress: string;
  dropAddress: string;

  pickUpLocation: {
    type: "Point";
    coordinates: [number, number];
  };

  dropLocation: {
    type: "Point";
    coordinates: [number, number];
  };

  fare: number;

  distanceInKm?: number;
  estimatedDuration?: number;

  userMobileNumber: string;
  driverMobileNumber?: string;

  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentDeadline: Date;

  paymentMethod?: "online" | "cash";

  adminCommission?: number;
  partnerAmount?: number;

  pickUpOtp?: string;
  pickUpOtpExpires?: Date;

  dropOtp?: string;
  dropOtpExpires?: Date;

  cancelledBy?: "user" | "driver" | "admin";
  cancellationReason?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

const bookingSchema = new mongoose.Schema<IBooking>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },

    pickUpAddress: {
      type: String,
      required: true,
      trim: true,
    },

    dropAddress: {
      type: String,
      required: true,
      trim: true,
    },

    pickUpLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        required: true,
        default: [0, 0],
      },
    },

    dropLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        required: true,
        default: [0, 0],
      },
    },

    fare: {
      type: Number,
      required: true,
      min: 0,
    },

    distanceInKm: {
      type: Number,
      default: 0,
    },

    estimatedDuration: {
      type: Number,
      default: 0,
    },

    userMobileNumber: {
      type: String,
      required: true,
    },

    driverMobileNumber: {
      type: String,
      default: null,
    },

    bookingStatus: {
      type: String,
      enum: [
        "idle",
        "requested",
        "confirmed",
        "searching",
        "driver_assigned",
        "accepted",
        "arriving",
        "arrived",
        "started",
        "completed",
        "awaiting_payment",
        "cancelled",
        "rejected",
        "expired",
      ],
      default: "idle",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "cash", "failed"],
      default: "pending",
    },

    paymentDeadline: {
      type: Date,
    },

    paymentMethod: {
      type: String,
      enum: ["online", "cash"],
      default: "cash",
    },

    adminCommission: {
      type: Number,
      default: 0,
    },

    partnerAmount: {
      type: Number,
      default: 0,
    },

    pickUpOtp: {
      type: String,
      default: null,
    },

    pickUpOtpExpires: {
      type: Date,
      default: null,
    },

    dropOtp: {
      type: String,
      default: null,
    },

    dropOtpExpires: {
      type: Date,
      default: null,
    },

    cancelledBy: {
      type: String,
      enum: ["user", "driver", "admin"],
      default: null,
    },

    cancellationReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ pickUpLocation: "2dsphere" });
bookingSchema.index({ dropLocation: "2dsphere" });

const Booking =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
