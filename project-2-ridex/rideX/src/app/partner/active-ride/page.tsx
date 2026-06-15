"use client";

import dynamic from "next/dynamic";

const LiveTracking = dynamic(() => import("@/components/LiveTracking"), {
  ssr: false,
});
// import LiveTracking from "@/components/LiveTracking"
import { BookingStatus, IBooking, PaymentStatus } from "@/models/booking.model";
import axios from "axios";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  ChevronUp,
  KeyRound,
  MapPin,
  Navigation,
  Zap,
} from "lucide-react";
import PanelContent from "@/components/PanelContent";
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
  // PickUp Otp
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  // Drop Otp
  const [dropOtpMode, setDropOtpMode] = useState(false);
  const [dropOtp, setDropOtp] = useState("");
  const [loadingDropOtp, setLoadingDropOtp] = useState(false);
  const [dropOtpVerified, setDropOtpVerified] = useState(false);
  const [dropOtpError, setDropOtpError] = useState("");

  const handleSendPickUpOtp = async () => {
    try {
      const { data } = await axios.post(
        "/api/partner/booking/otp/pickupOtp/send",
        {
          bookingId: booking?._id,
        }
      );
    

      setOtpMode(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSendDropOtp = async () => {
    try {
      const { data } = await axios.post("/api/partner/booking/otp/drop/send", {
        bookingId: booking?._id,
      });
       
      setDropOtpMode(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleVerifyPickUpOtp = async () => {
    setLoadingOtp(true);
    try {
      const { data } = await axios.post(
        "/api/partner/booking/otp/pickupOtp/verify",
        {
          bookingId: booking?._id,
          otp,
        }
      );
      setOtpVerified(true);
      setStatus("started");
      setLoadingOtp(false);
      setOtpMode(false);
      setBooking((prev) =>
        prev ? { ...prev, bookingStatus: "started" } : prev
      );
    } catch (error: any) {
      console.log(error);
      setOtpError(error?.response?.data?.message ?? "VerificationFailed");
      setLoadingOtp(false);
    }
  };

  const handleVerifyDropOtp = async () => {
    setLoadingDropOtp(true);
    try {
      const { data } = await axios.post(
        "/api/partner/booking/otp/drop/verify",
        {
          bookingId: booking?._id,
          otp: dropOtp,
        }
      );
      setDropOtpVerified(true);
      setStatus("completed");
      setLoadingDropOtp(false);
      setDropOtpMode(true);
      setBooking((prev) =>
        prev ? { ...prev, bookingStatus: "completed" } : prev
      );
     
    } catch (error: any) {
      console.log(error.response?.status);
      setDropOtpError(error?.response?.data?.message ?? "VerificationFailed");
      setLoadingDropOtp(false);
    }
  };

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/partner/my-active");
        if (!data) {
          setLoading(false);
          setBooking(null);
          return;
        }
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
        console.log(error.response?.data?.message || "An error occurred");
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const onChatToggle = () => {
    setChatOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }
    if (!booking?._id) return;
    const socket = getSocket();
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setDriverPos([lat, lon]);
        socket.emit("driver-location-update", {
          bookingId: booking?._id,
          lat: lat,
          lon: lon,
          status: status,
        });
      },
      (error) => {
        console.log("gps error", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 10000,
      }
    );
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [booking?._id]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("join-ride", booking?._id);
    socket.on("driver-location", ({ lat, lon }) => {
      setDriverPos([lat, lon]);
    });

    return () => {
      socket.off("join-ride");
      socket.off("driver-location");
    };
  }, [booking?._id]);

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

  if (!booking) {
    return (
      <div className="bg-black w-full h-screen flex justify-center items-center text-[40px] text-white">
        No Active Ride Found
      </div>
    );
  }

  if (status === "completed" && booking) {
    return <CompletedScreen booking={booking} role="driver" />;
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
    currentRole: "driver",
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
            <span className="text-xs font-semibold tracking-wide texxt-zinc-900">
              {cfg.sublabel}
            </span>
          </div>
        </motion.div>
      </div>

      {/* for desktop */}

      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex w-105 xl:w-115 bg-white border border-zinc-100 flex-col overflow-hidden"
      >
        <div className="bg-zinc-950 px-6 py-5 shrink-0">
          <p className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase font-semibold mb-1">
            Driver Panel
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
          <div className="shrink-0 border-t border-zinc-100 bg-white px-5 py-4">
            <AnimatePresence mode="wait">
              {status === "confirmed" && !otpMode && !otpVerified && (
                <motion.div
                  key="arrived"
                  onClick={() => {
                    handleSendPickUpOtp();
                  }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 active:scale-[0.97] text-white py-4 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MapPin size={15} />I have arrived at Pickup
                  <ArrowRight size={15} className="ml-1" />
                </motion.div>
              )}
              {status === "confirmed" && otpMode && !otpVerified && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden"
                >
                  <div className="bg-zinc-950 px-4 py-3 flex items-center gap-2">
                    <KeyRound size={14} className="text-amber-400" />
                    <p className="text-white text-xs font-bold tracking-wide uppercase">
                      Enter Customer App
                    </p>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-zinc-500">
                      Ask the customer for their 4-digit OTP to start the ride.
                    </p>
                    <div className="flex justify-center">
                      <input
                        onChange={(e) => {
                          setOtp(e.target.value.replace(/\D/g, ""));
                          setOtpError("");
                        }}
                        placeholder=". . . ."
                        className="w-48 border-zinc-200 focus:border-zinc-900 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-black outline-none transition-colors"
                        type="text"
                      />
                    </div>
                    {otpError && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-500 text-xs text-center font-medium"
                      >
                        {otpError}
                      </motion.p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setOtpMode(false);
                          setOtp("");
                          setOtpError("");
                        }}
                        className="flex-1 border border-zinc-200 bg-white text-zinc-700 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.97] transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleVerifyPickUpOtp}
                        disabled={loadingOtp || otp.length < 4}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity:-40 text-white py-2.5 rounded-xl text-sm font-bold active:scale-[0.97] transition-all"
                      >
                        {loadingOtp ? (
                          <span className="flex items-center justify-center gap-2">
                            Verifying...
                          </span>
                        ) : (
                          <span>Verify OTP</span>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* drop */}
              {status === "started" && !dropOtpMode && !dropOtpVerified && (
                <motion.div
                  key="drop"
                  onClick={() => {
                    handleSendDropOtp();
                  }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 active:scale-[0.97] text-white py-4 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Navigation size={15} />
                  Mark as Drop
                  <ArrowRight size={15} className="ml-1" />
                </motion.div>
              )}
              {status === "started" && dropOtpMode && !otpVerified && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden"
                >
                  <div className="bg-zinc-950 px-4 py-3 flex items-center gap-2">
                    <KeyRound size={14} className="text-amber-400" />
                    <p className="text-white text-xs font-bold tracking-wide uppercase">
                      Enter Customer App
                    </p>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-zinc-500">
                      Ask the customer for their 4-digit OTP to Complete the
                      ride.
                    </p>
                    <div className="flex justify-center">
                      <input
                        onChange={(e) => {
                          setDropOtp(e.target.value.replace(/\D/g, ""));
                          setDropOtpError("");
                        }}
                        placeholder=". . . ."
                        className="w-48 border-zinc-200 focus:border-zinc-900 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-black outline-none transition-colors"
                        type="text"
                      />
                    </div>
                    {dropOtpError && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-500 text-xs text-center font-medium"
                      >
                        {dropOtpError}
                      </motion.p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setDropOtpMode(false);
                          setDropOtp("");
                          setDropOtpError("");
                        }}
                        className="flex-1 border border-zinc-200 bg-white text-zinc-700 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.97] transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleVerifyDropOtp}
                        disabled={loadingDropOtp || dropOtp.length < 4}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity:-40 text-white py-2.5 rounded-xl text-sm font-bold active:scale-[0.97] transition-all"
                      >
                        {loadingOtp ? (
                          <span className="flex items-center justify-center gap-2">
                            Verifying...
                          </span>
                        ) : (
                          <span>Verify OTP</span>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* for mobile */}

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

          <div className="shrink-0 border-t border-zinc-100 bg-white px-5 py-4">
            <AnimatePresence mode="wait">
              {status === "confirmed" && !otpMode && !otpVerified && (
                <motion.div
                  key="arrived"
                  onClick={() => {
                    handleSendPickUpOtp();
                  }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 active:scale-[0.97] text-white py-4 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MapPin size={15} />I have arrived at Pickup
                  <ArrowRight size={15} className="ml-1" />
                </motion.div>
              )}
              {status === "confirmed" && otpMode && !otpVerified && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden"
                >
                  <div className="bg-zinc-950 px-4 py-3 flex items-center gap-2">
                    <KeyRound size={14} className="text-amber-400" />
                    <p className="text-white text-xs font-bold tracking-wide uppercase">
                      Enter Customer App
                    </p>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-zinc-500">
                      Ask the customer for their 4-digit OTP to start the ride.
                    </p>
                    <div className="flex justify-center">
                      <input
                        onChange={(e) => {
                          setOtp(e.target.value.replace(/\D/g, ""));
                          setOtpError("");
                        }}
                        placeholder=". . . ."
                        className="w-48 border-zinc-200 focus:border-zinc-900 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-black outline-none transition-colors"
                        type="text"
                      />
                    </div>
                    {otpError && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-500 text-xs text-center font-medium"
                      >
                        {otpError}
                      </motion.p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setOtpMode(false);
                          setOtp("");
                          setOtpError("");
                        }}
                        className="flex-1 border border-zinc-200 bg-white text-zinc-700 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.97] transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleVerifyPickUpOtp}
                        disabled={loadingOtp || otp.length < 4}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity:-40 text-white py-2.5 rounded-xl text-sm font-bold active:scale-[0.97] transition-all"
                      >
                        {loadingOtp ? (
                          <span className="flex items-center justify-center gap-2">
                            Verifying...
                          </span>
                        ) : (
                          <span>Verify OTP</span>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* drop */}
              {status === "started" && !dropOtpMode && !dropOtpVerified && (
                <motion.div
                  key="drop"
                  onClick={() => {
                    handleSendDropOtp();
                  }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 active:scale-[0.97] text-white py-4 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Navigation size={15} />
                  Mark as Drop
                  <ArrowRight size={15} className="ml-1" />
                </motion.div>
              )}
              {status === "started" && dropOtpMode && !otpVerified && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden"
                >
                  <div className="bg-zinc-950 px-4 py-3 flex items-center gap-2">
                    <KeyRound size={14} className="text-amber-400" />
                    <p className="text-white text-xs font-bold tracking-wide uppercase">
                      Enter Customer App
                    </p>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-zinc-500">
                      Ask the customer for their 4-digit OTP to Complete the
                      ride.
                    </p>
                    <div className="flex justify-center">
                      <input
                        onChange={(e) => {
                          setDropOtp(e.target.value.replace(/\D/g, ""));
                          setDropOtpError("");
                        }}
                        placeholder=". . . ."
                        className="w-48 border-zinc-200 focus:border-zinc-900 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-black outline-none transition-colors"
                        type="text"
                      />
                    </div>
                    {dropOtpError && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-500 text-xs text-center font-medium"
                      >
                        {dropOtpError}
                      </motion.p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setDropOtpMode(false);
                          setDropOtp("");
                          setDropOtpError("");
                        }}
                        className="flex-1 border border-zinc-200 bg-white text-zinc-700 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.97] transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleVerifyDropOtp}
                        disabled={loadingDropOtp || dropOtp.length < 4}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity:-40 text-white py-2.5 rounded-xl text-sm font-bold active:scale-[0.97] transition-all"
                      >
                        {loadingOtp ? (
                          <span className="flex items-center justify-center gap-2">
                            Verifying...
                          </span>
                        ) : (
                          <span>Verify OTP</span>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Page;
