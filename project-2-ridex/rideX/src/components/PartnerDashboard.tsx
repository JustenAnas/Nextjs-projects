"use client";
import { RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import { ArrowRight, Check, Clock, Lock, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import RejectionCard from "./RejectionCard";
import StatusCard from "./StatusCard";
import ActionCard from "./ActionCard";
import axios from "axios";
import PricingModal from "./PricingModal";
import { IVehicle } from "@/models/vehicle.model";
import PartnerEarning from "./PartnerEarning";

type Step = {
  id: number;
  title: string;
  route?: string;
};

const STEPS: Step[] = [
  { id: 1, title: "Vehicle", route: "/partner/onboarding/vehicle" },
  { id: 2, title: "Documents", route: "/partner/onboarding/documents" },
  { id: 3, title: "Bank", route: "/partner/onboarding/bank" },
  { id: 4, title: "Review" },
  { id: 5, title: "Video KYC" },
  { id: 6, title: "Pricing" },
  { id: 7, title: "Final Review" },
  { id: 8, title: "Live" },
];

const TOTAL_STEPS = STEPS.length;

const PartnerDashboard = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [requestLoading, setRequestLoading] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [vehiclData, setVehiclData] = useState<IVehicle | null>(null);
  const { userData } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (userData) {
      setActiveStep(userData.partnerOnBoardingSteps + 1);
    }
  }, [userData]);

  const handleGetPricing = async () => {
    try {
      const { data } = await axios.get("/api/partner/onboarding/pricing");
      console.log(data);
      setVehiclData(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetPricing();
  }, []);

  const goToStep = (step: Step) => {
    if (
      step.id === 6 &&
      userData?.partnerStatus === "approved" &&
      userData?.videoKycStatus === "approved"
    ) {
      setShowPricing(true);
      return;
    }
    if (step.route && step.id <= activeStep) {
      router.push(step.route);
    }
  };

  const progressPercentage = ((activeStep - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 px-4 pt-28 pb-20">
      <div className="max-w-7xl mx-auto space-y-16">
        <div>
          <h1 className="text-4xl font-bold">Partner Onboarding</h1>
          <p className="text-gray-600 mt-3">
            Complete all steps to activate your account
          </p>
        </div>

        <div className="bg-white rounded-3xl p-10 shadow-xl border overflow-x-auto">
          <div className="relative min-w-200">
            <div className="absolute top-7 left-0 w-full h-0.75 bg-gray-200 rounded-full" />
            <motion.div
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.6 }}
              className="absolute top-7 left-0 h-0.75 bg-black rounded-full"
            />
            <div className="relative flex justify-between">
              {STEPS.map((steps) => {
                const completed = steps.id < activeStep;
                const active = steps.id === activeStep;
                const locked = steps.id > activeStep;
                return (
                  <motion.div
                    onClick={() => goToStep(steps)}
                    key={steps.id}
                    whileHover={!locked ? { scale: 1.1 } : {}}
                    className="flex flex-col items-center z-10 cursor-pointer"
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all
                        ${
                          completed
                            ? "bg-black text-white border-black"
                            : active
                              ? "border-black bg-white"
                              : "border-gray-300 text-gray-400 bg-white"
                        }`}
                    >
                      {completed ? (
                        <Check size={20} />
                      ) : locked ? (
                        <Lock size={20} />
                      ) : (
                        <span className="font-bold text-black">{steps.id}</span>
                      )}
                    </div>
                    <p className="mt-3 text-sm font-semibold text-center">
                      {steps.title}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {userData?.videoKycStatus === "rejected" && (
          <RejectionCard
            title="Video KYC Rejected"
            reason={userData?.videoKycRejectionReason}
            actionLabel={requestLoading ? "Requesting..." : "Request Again"}
            onAction={async () => {
              setRequestLoading(true);
              await axios.get("/api/partner/video-kyc/request");
              setRequestLoading(false);
            }}
          />
        )}

        {userData?.videoKycStatus === "pending" && (
          <StatusCard
            icon={<Clock size={18} />}
            title="Waiting for Admin"
            desc="Admin will initiate Video KYC shortly."
          />
        )}

        {/* ← card disappears when activeStep moves to 7 after pricing submitted */}
        {userData?.videoKycStatus === "approved" && activeStep === 6 && (
          <ActionCard
            icon={<Check size={18} />}
            title="Video KYC Approved"
            button="Set Pricing"
            onClick={() => setShowPricing(true)}
          />
        )}

        {userData?.videoKycStatus === "in_progress" &&
          userData?.videoKycRoomId && (
            <ActionCard
              icon={<Video size={18} />}
              title="Admin Started Video KYC"
              button="Join Call"
              onClick={() =>
                router.push(`/video-kyc/${userData.videoKycRoomId}`)
              }
            />
          )}

        {activeStep === 7 && vehiclData?.status === "pending" && (
          <StatusCard
            icon={<Clock size={20} />}
            title="Pricing Under Review"
            desc="Admin is reviewing your pricing."
          />
        )}
        {activeStep === 7 && vehiclData?.status === "rejected" && (
          <RejectionCard
            title="Pricing Rejected"
            reason={vehiclData.rejectionReason}
            actionLabel="Edit & Resubmit"
            onAction={() => setShowPricing(true)}
          />
        )}

        {activeStep === 8 && vehiclData?.status === "approved" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black text-white rounded-3xl p-10 shadow-2xl"
          >
            <h2 className="text-2xl font-bold">🚀 You're Live</h2>
            <button className="mt-6 bg-white text-black px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
              Go To Bookings <ArrowRight size={16} />
            </button>
          </motion.div>
        )}

        <PartnerEarning />
      </div>
      <PricingModal
        open={showPricing}
        onClose={() => {
          setShowPricing(false);
          handleGetPricing();
        }}
        data={vehiclData}
      />
    </div>
  );
};

export default PartnerDashboard;
