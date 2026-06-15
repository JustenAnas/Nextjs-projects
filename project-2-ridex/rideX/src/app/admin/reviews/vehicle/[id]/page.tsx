"use client";

import { IUser } from "@/models/user.model";
import { vehicleType } from "@/models/vehicle.model";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle,
  CircleDashed,
  Clock,
  ImageIcon,
  IndianRupee,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import AnimatedCard from "@/components/AnimatedCard";

interface IVehicle {
  owner: IUser;
  type: vehicleType;
  vehicleModel: string;
  licensePlate: string;
  imageUrl?: string;
  baseFare?: number;
  pricePerKm?: number;
  waitingCharge?: number;
  status: "approved" | "pending" | "rejected";
  rejectionReason?: string;
  isActtive: boolean;
  createdAt: Date;
  upDatedAt: Date;
}

const Page = () => {
  const { id } = useParams();
  const [data, setData] = useState<IVehicle>();
  const [approve, setApprove] = useState(false);
  const [reject, setReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [loading, setLoading] = useState();
  const router = useRouter();
  useEffect(() => {
    const load = async () => {
      try {
        const result = await axios.get(`/api/admin/reviews/vehicle/${id}`);
        
        setData(result.data);
      } catch (error: any) {
        console.log(error.response.data.message ?? error);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-gray-500">
        Loading Partner...
      </div>
    );
  }

  const handleApprove = async () => {
    setApproveLoading(true);
    try {
      const { data } = await axios.get(
        `/api/admin/reviews/vehicle/${id}/approve`
      );
     
      setApprove(false);
      setApproveLoading(false);
      router.push("/");
    } catch (error) {
      console.log(error);
      setApproveLoading(false);
    }
  };

  const handleReject = async () => {
    setRejectLoading(true);
    if (!rejectionReason.trim()) return;
    try {
      const { data } = await axios.post(
        `/api/admin/reviews/vehicle/${id}/reject`,
        {
          reason: rejectionReason,
        }
      );
      
      setReject(false);
      setRejectLoading(false);
      router.push("/");
      setRejectionReason("");
      router.back();
    } catch (error) {
      console.log(error);
      setRejectLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <div className="font-semibold text-lg">{data?.owner?.username}</div>
            <div className="text-xs text-gray-500">{data?.owner?.email}</div>
          </div>
          {data?.status === "approved" ? (
            <div className="px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 bg-green-100 text-green-700">
              <CheckCircle size={14} />
              Approved
            </div>
          ) : data?.status === "rejected" ? (
            <div className="px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 bg-red-100 text-red-700">
              <X size={14} />
              Rejected
            </div>
          ) : (
            <div className="px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 bg-purple-100 text-purple-700">
              <Clock size={14} />
              Pending
            </div>
          )}
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl overflow-hidden shadow-xl bg-white"
        >
          {data?.imageUrl ? (
            <img
              src={data.imageUrl}
              alt="vehicle image"
              className="w-full h-112.5 object-cover"
            />
          ) : (
            <div className="h-112.5 grid place-items-center text-gray-300">
              <ImageIcon size={25} />
            </div>
          )}
        </motion.div>
        <div className="space-y-8">
          <AnimatedCard title={"Vehicle Details"} icon={<Truck size={18} />}>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Vehicle Type</span>
              <span className="font-semibold">{data?.type || "-"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Vehicle Model</span>
              <span className="font-semibold">{data?.vehicleModel || "-"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Vehicle Registration Number</span>
              <span className="font-semibold">{data?.licensePlate || "-"}</span>
            </div>
          </AnimatedCard>

          <AnimatedCard
            title={"Pricing Configuration"}
            icon={<IndianRupee size={18} />}
          >
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Base Fare</span>
              <span className="font-semibold flex items-center  ">
                <IndianRupee size={13} />
                {data?.baseFare || 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Price per Km</span>
              <span className="font-semibold flex items-center  ">
                <IndianRupee size={13} />
                {data?.pricePerKm || 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Waiting Charg</span>
              <span className="font-semibold flex items-center  ">
                <IndianRupee size={13} />
                {data?.waitingCharge || 0}
              </span>
            </div>
          </AnimatedCard>

          {data?.status === "pending" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-4xl p-8 shadow-xl space-y-6"
            >
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck size={18} />
                Admin Check
              </div>
              <p className="text-sm text-gray-500">
                Verify documents carefully before approving
              </p>
              <div className="flex flex-col gap-4">
                <button
                  className="py-3 rounded-2xl bg-linear-to-r from-black to-gray-800 text-white font-semibold hover:opacity-90 transition"
                  onClick={() => setApprove(true)}
                >
                  Approve
                </button>
                <button
                  className="py-3 rounded-2xl border font-semibold hover:bg-gray-100 transition"
                  onClick={() => setReject(true)}
                >
                  Reject
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      {/* Approve Modal */}
      <AnimatePresence>
        {approve && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm"
            >
              <h2 className="text-lg font-bold">Approve Vehcile</h2>
              <p className="text-sm text-gray-500 mt-2">
                Confirm all information has been verified.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 py-2 rounded-xl border"
                  onClick={() => setApprove(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 flex py-2 items-center justify-center rounded-xl bg-black text-white"
                  onClick={handleApprove}
                  disabled={approveLoading}
                >
                  {approveLoading ? (
                    <CircleDashed className="text-white animate-spin" />
                  ) : (
                    "Yes, Approve"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {reject && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm"
            >
              <h2 className="text-lg font-bold">Reject Vehicle</h2>
              <p className="text-sm text-gray-500 mt-2">
                Please provide a reason for rejection.
              </p>
              <textarea
                placeholder="Enter rejection reason (required)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full mt-3 border rounded-xl p-3 text-sm"
              />
              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 py-2 rounded-xl border"
                  onClick={() => setReject(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 flex py-2 rounded-xl items-center justify-center bg-black text-white disabled:opacity-40"
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || rejectLoading}
                >
                  {rejectLoading ? (
                    <CircleDashed className="text-white animate-spin" />
                  ) : (
                    "Reject"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Page;
