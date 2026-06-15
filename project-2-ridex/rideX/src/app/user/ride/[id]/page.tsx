"use client";

import dynamic from "next/dynamic";

const LiveTracking = dynamic(() => import("@/components/LiveTracking"), {
  ssr: false,
});
// import LiveTracking from "@/components/LiveTracking"
import { BookingStatus, IBooking, PaymentStatus } from "@/models/booking.model";
import axios from "axios";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronUp, Zap } from "lucide-react";
import PanelContent from "@/components/PanelContent";
import { useParams } from "next/navigation";
import { getSocket } from "@/lib/socket";
import CompletedScreen from "@/components/CompletedScreen";

const MAP_STATUS: Record<BookingStatus, "arriving" | "ongoing" | "completed"> =
  {
    idle: "arriving",
    searching: "arriving",
    driver_assigned: "arriving",
    accepted: "arriving",
    arriving: "arriving",
    arrived: "arriving",
    requested: "arriving",
    awaiting_payment: "arriving",
    confirmed: "arriving",
    started: "ongoing",
    completed: "completed",
    cancelled: "completed",
    rejected: "completed",
    expired: "completed",
  };

const STATUS_LABEL: Record<
  BookingStatus,
  { label: string; sublabel: string; dot: string }
> = {
  idle: {
    label: "Awaiting Confirmation",
    sublabel: "Customer payment is pending",
    dot: "bg-amber-400",
  },
  searching: {
    label: "Searching",
    sublabel: "Looking for nearby drivers",
    dot: "bg-amber-400",
  },
  driver_assigned: {
    label: "Driver Assigned",
    sublabel: "Driver is on the way",
    dot: "bg-blue-400",
  },
  accepted: {
    label: "Accepted",
    sublabel: "Driver accepted your ride",
    dot: "bg-green-400",
  },
  arriving: {
    label: "Driver Arriving",
    sublabel: "Driver is heading to pickup",
    dot: "bg-blue-400",
  },
  arrived: {
    label: "Driver Arrived",
    sublabel: "Driver is at pickup location",
    dot: "bg-green-400",
  },
  requested: {
    label: "Awaiting Confirmation",
    sublabel: "Customer payment is pending",
    dot: "bg-amber-400",
  },
  awaiting_payment: {
    label: "Awaiting Payment",
    sublabel: "Customer is completing payment",
    dot: "bg-blue-400",
  },
  confirmed: {
    label: "Ride Confirmed",
    sublabel: "Head to pickup location",
    dot: "bg-green-400",
  },
  started: {
    label: "Ride In Progress",
    sublabel: "Trip is underway",
    dot: "bg-purple-400",
  },
  completed: {
    label: "Ride Completed",
    sublabel: "Trip has ended",
    dot: "bg-gray-400",
  },
  cancelled: {
    label: "Ride Cancelled",
    sublabel: "This ride was cancelled",
    dot: "bg-red-400",
  },
  rejected: {
    label: "Ride Rejected",
    sublabel: "You rejected this ride",
    dot: "bg-orange-400",
  },
  expired: {
    label: "Ride Expired",
    sublabel: "Booking time has expired",
    dot: "bg-gray-400",
  },
};

const PAYMENT_BADGE: Record<PaymentStatus, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-700" },
  paid: { label: "Paid", cls: "bg-amber-100 text-amber-700" },
  cash: { label: "Cash", cls: "bg-amber-100 text-amber-700" },
  failed: { label: "Failed", cls: "bg-amber-100 text-amber-700" },
};

function Page() {
  const [booking, setBooking] = useState<IBooking | null>(null);
  const [loading, setLoading] = useState(false);
  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
  const [pickupPos, setPickUpPos] = useState<[number, number] | null>(null);
  const [dropPos, setDropPos] = useState<[number, number] | null>(null);
  const [distanceToPickup, setDistanceToPickup] = useState(0);
  const [distanceToDrop, setDistanceToDrop] = useState(0);
  const [etaToPickUp, setetaToPickUp] = useState(0);
  const [etaToDrop, setEtaToDrop] = useState(0);
  const [status, setStatus] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const { data } = await axios.post("/api/user/active-ride", {
          bookingId: id,
        });
        setBooking(data);
        setPickUpPos([
          data.pickUpLocation.coordinates[1],
          data.pickUpLocation.coordinates[0],
        ]);
        setDropPos([
          data.dropLocation.coordinates[1],
          data.dropLocation.coordinates[0],
        ]);
        setStatus(data.bookingStatus);
        setLoading(false);
      } catch (error: any) {
      
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const onChatToggle = () => {
    setChatOpen((prev) => !prev);
  };

  useEffect(() => {
    const socket = getSocket();
    socket.emit("join-ride", id);
    socket.on("driver-location", ({ lat, lon }) => {
      setDriverPos([lat, lon]);
    });
    return () => {
      socket.off("join-ride");
      socket.off("driver-location");
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-zinc-800 border-t-white animate-spin" />
          <p className="text-white/40 text-sm tracking-widest uppercase font-medium">
            Loading Ride...
          </p>
        </div>
      </div>
    );
  }

  if (status === "completed" && booking) {
    return <CompletedScreen booking={booking} role="user" />;
  }

  const cfg = STATUS_LABEL[booking?.bookingStatus! ?? "confirmed"];
  const canChat = booking?.bookingStatus === "confirmed";
  const isActive = ["confirmed", "started"].includes(status);
  const displayEta = status === "confirmed" ? etaToPickUp : etaToDrop;
  const displayDistance =
    status === "confirmed" ? distanceToPickup : distanceToDrop;
  const paymentStatus = PAYMENT_BADGE[booking?.paymentStatus! ?? "pending"];
  const panelProps = {
    isActive,
    displayEta,
    displayDistance,
    cfg,
    status,
    booking,
    paymentStatus,
    canChat,
    chatOpen,
    onChatToggle,
    currentRole: "user",
  };

  return (
    <div className="h-screen w-full bg-zinc-100 flex flex-col lg:flex-row overflow-hidden">
      <div className="relative flex-1 h-full z-0">
        <LiveTracking
          driverLocation={driverPos}
          pickUpLocation={pickupPos}
          dropLocation={dropPos}
          mapStatus={MAP_STATUS[booking?.bookingStatus!]}
          onStats={({
            distanceToDrop,
            etaToDrop,
            distanceToPickUp,
            etaToPickup,
          }) => {
            setDistanceToPickup(distanceToPickUp);
            setetaToPickUp(etaToPickup);
            setDistanceToDrop(distanceToDrop);
            setEtaToDrop(etaToDrop);
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-500 pointer-events-none"
        >
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-zinc-100">
            <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
            <span className="text-xs font-semibold tracking-wide text-zinc-900">
              {cfg.sublabel}
            </span>
          </div>
        </motion.div>
      </div>
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex w-105 xl:w-115 bg-white border border-zinc-100 flex-col overflow-hidden"
      >
        <div className="bg-zinc-950 px-6 py-5 shrink-0">
          <p className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase font-semibold mb-1">
            User Panel
          </p>
          <div className="flex items-center justify-between mt-2">
            <h1 className="text-white text-xl font-bold">Active Ride</h1>

            {isActive && (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                <Zap size={12} className="text-amber-400" />
                <span className="text-white text-xs font-semibold">
                  {Math.round(displayEta)}min
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto scroll-hide">
            <PanelContent {...panelProps} />
          </div>
        </div>
      </motion.div>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
        <motion.div
          className="bg-white rounded-t-3xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col"
          animate={{ height: expanded ? "82vh" : 142 }}
          transition={{ type: "spring", stiffness: 320, damping: 38 }}
        >
          <div
            onClick={() => setExpanded((p) => !p)}
            className="shrink-0 cursor-pointer select-none"
          >
            <div className="pt-3 pb-1">
              <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto" />
            </div>
            <div className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`}
                />
                <div>
                  <p className="text-sm font-bold text-zinc-900 leading-tight">
                    {cfg.label}
                  </p>
                  <p className="text-xs text-zinc-400 leading-tight">
                    {cfg.sublabel}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isActive && (
                  <div className="text-right">
                    <p className="text-2xl font-black text-zinc-900 leading-none">
                      {Math.round(displayEta)}
                    </p>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                      min
                    </p>
                  </div>
                )}
                <motion.div
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.28 }}
                  className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center"
                >
                  <ChevronUp size={16} className="text-zinc-600" />
                </motion.div>
              </div>
            </div>
            <div className="h-px bg-zinc-100 mx-5" />
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            <PanelContent {...panelProps} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Page;
