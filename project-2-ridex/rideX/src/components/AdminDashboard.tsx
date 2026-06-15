"use client";
import axios from "axios";
import {
  CheckCircleIcon,
  Clock,
  Truck,
  Users,
  UserStar,
  Video,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Kpi from "./Kpi";
import TabButton from "./TabButton";
import { BsTruckFront } from "react-icons/bs";
import { AnimatePresence } from "motion/react";
import ContentList from "./ContentList";
import AdminEarning from "./AdminEarning";

type Stats = {
  totalPartners: number;
  totalApprovedPartners: number;
  totalPendingPartners: number;
  totalRejectedPartners: number;
};

type Tab = "partner" | "kyc" | "vehicle";
const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("partner");
  const [partnerReviews, setPartnerReviews] = useState<any>();
  const [kycReviews, setKycReviews] = useState<any>();
  const [vehiclesReviews, setVehiclesReviews] = useState<any>();
  const handleGetData = async () => {
    try {
      const { data } = await axios.get("/api/admin/dashboard");
      console.log(data);

      setStats(data.stats);
      setPartnerReviews(data.pendingPartnerReviews);
      setVehiclesReviews(data.pendingVehicles);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetPendingKyc = async () => {
    try {
      const { data } = await axios.get("/api/admin/video-kyc/pending");
      setKycReviews(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetData();
    handleGetPendingKyc();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
      <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b z-40">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={"/logo.png"}
              alt="logo"
              width={44}
              height={44}
              priority
              className="bg-black rounded-lg p-0.5 object-contain"
            />
            <span className="font-bold text-lg tracking-wide">Admin</span>
          </div>
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-black text-white">
            <UserStar size={14} />
            Admin Dashboard
          </div>
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <Kpi
            label="Total Partners"
            value={stats?.totalPartners}
            icon={<Users />}
            varient={"totalPartners"}
          />
          <Kpi
            label="Approved Partners"
            value={stats?.totalApprovedPartners}
            icon={<CheckCircleIcon />}
            varient={"approved"}
          />
          <Kpi
            label="Pending Partners"
            value={stats?.totalPendingPartners}
            icon={<Clock />}
            varient={"pending"}
          />
          <Kpi
            label="Rejected Partners"
            value={stats?.totalRejectedPartners}
            icon={<XCircle />}
            varient={"rejected"}
          />
        </div>
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 flex flex-wrap gap-2">
          <TabButton
            active={activeTab == "partner"}
            count={partnerReviews?.length ?? 0}
            icon={<Users size={15} />}
            onClick={() => setActiveTab("partner")}
          >
            Pending Partner Reviews
          </TabButton>
          <TabButton
            active={activeTab == "kyc"}
            count={kycReviews?.length ?? 0}
            icon={<Video size={15} />}
            onClick={() => setActiveTab("kyc")}
          >
            Pending Video Kyc
          </TabButton>
          <TabButton
            active={activeTab == "vehicle"}
            count={vehiclesReviews?.length ?? 0}
            icon={<BsTruckFront size={15} />}
            onClick={() => setActiveTab("vehicle")}
          >
            Pending Vehicle Reviews
          </TabButton>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="space-y-3"
          >
            {activeTab == "partner" && (
              <ContentList data={partnerReviews ?? []} type={"partner"} />
            )}
            {activeTab == "kyc" && (
              <ContentList data={kycReviews ?? []} type={"kyc"} />
            )}
            {activeTab == "vehicle" && (
              <ContentList data={vehiclesReviews ?? []} type={"vehicle"} />
            )}
          </motion.div>
        </AnimatePresence>
        <AdminEarning />
      </main>
    </div>
  );
};

export default AdminDashboard;
