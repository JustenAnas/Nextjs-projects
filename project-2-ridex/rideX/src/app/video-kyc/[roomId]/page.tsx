"use client";

import { RootState } from "@/redux/store";
import axios from "axios";
import {
  CheckCircle,
  Mic,
  MicOff,
  PhoneOff,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const Page = () => {
  const [joined, setJoined] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [aLoading, setALoading] = useState(false);
  const [rLoading, setRLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  const previewRef = useRef<HTMLVideoElement>(null);
  const zpRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { userData } = useSelector((state: RootState) => state.user);
  const { roomId } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (joined) return;
    let localStream: MediaStream;
    const init = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(localStream);
        if (previewRef.current) {
          previewRef.current.srcObject = localStream;
        }
      } catch (error) {
        console.log(error);
      }
    };
    init();
    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
    };
  }, [joined]);

  const toggleCamera = () => {
    if (!stream) return;
    stream.getVideoTracks().forEach((track) => (track.enabled = !cameraOn));
    setCameraOn(!cameraOn);
  };

  const toggleMic = () => {
    if (!stream) return;
    stream.getAudioTracks().forEach((track) => (track.enabled = !micOn));
    setMicOn(!micOn);
  };

  const handleApprove = async () => {
    setALoading(true);
    try {
      const { data } = await axios.post("/api/admin/video-kyc/complete", {
        roomId,
        action: "approved",
      });
     
      setShowApprovalModal(false);
      router.push("/");
    } catch (error: any) {
      console.log(error.response?.data?.message ?? error);
    } finally {
      setALoading(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) return;
    setRLoading(true);
    try {
      const { data } = await axios.post("/api/admin/video-kyc/complete", {
        roomId,
        action: "rejected",
        reason,
      });
     
      setShowRejectionModal(false);
      setReason("");
      router.push("/");
    } catch (error: any) {
      console.log(error.response?.data?.message ?? error);
    } finally {
      setRLoading(false);
    }
  };

  const handleEndCall = () => {
    if (zpRef.current) {
      zpRef.current.destroy();
      zpRef.current = null;
    }
    stream?.getTracks().forEach((t) => t.stop());
    setJoined(false);
    setStream(null);
    router.push("/");
  };

  const startCall = async () => {
    if (joined || zpRef.current) return;
    if (!containerRef.current) return;

    setLoading(true);
    const displayName =
      userData?.role === "admin"
        ? "Admin"
        : `${userData?.username}(${userData?.email})`;
    try {
      const { ZegoUIKitPrebuilt } =
        await import("@zegocloud/zego-uikit-prebuilt");

      const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appId,
        serverSecret!,
        roomId?.toString()!,
        userData?._id.toString()!,
        displayName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zpRef.current = zp;

      if (!containerRef.current) return;

      zp.joinRoom({
        container: containerRef.current,
        scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
        showPreJoinView: false,
      });

      setJoined(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex-flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Image src={"/logo.png"} alt="logo" width={44} height={44} priority />
          <p className="text-xs text-gray-400">
            {userData?.role === "admin"
              ? "Admin Verification"
              : "Partner Video KYC"}
          </p>
        </div>
      </div>

      {/* Call controls bar — shown only when joined */}
      {joined && (
        <div className="px-6 py-3 border-b border-white/10 flex flex-wrap items-center gap-3">
          {userData?.role === "admin" && (
            <>
              <button
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full text-sm flex items-center gap-2 transition"
                onClick={() => setShowApprovalModal(true)}
              >
                <CheckCircle size={16} />
                Approve
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-sm flex items-center gap-2 transition"
                onClick={() => setShowRejectionModal(true)}
              >
                <X size={16} />
                Reject
              </button>
            </>
          )}
          <button
            className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-full text-sm flex items-center gap-2 transition"
            onClick={handleEndCall}
          >
            <PhoneOff size={16} />
            End Call
          </button>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 relative">
        <div
          ref={containerRef}
          className={`absolute inset-0 ${joined ? "block" : "hidden"}`}
        />
        {!joined && (
          <div className="h-full flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                <video
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-75 object-cover"
                  ref={previewRef}
                />
                {!cameraOn && (
                  <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <VideoOff size={40} />
                  </div>
                )}
              </div>
              <div className="text-center space-y-8 lg:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold">
                  Secure Video KYC
                </h1>
                <div className="flex justify-center lg:justify-start gap-6">
                  <button
                    onClick={toggleCamera}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                      cameraOn
                        ? "bg-white text-black"
                        : "bg-white/10 border border-white/20"
                    }`}
                  >
                    {cameraOn ? <Video /> : <VideoOff />}
                  </button>
                  <button
                    onClick={toggleMic}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                      micOn
                        ? "bg-white text-black"
                        : "bg-white/10 border border-white/20"
                    }`}
                  >
                    {micOn ? <Mic /> : <MicOff />}
                  </button>
                </div>
                <button
                  onClick={startCall}
                  disabled={loading}
                  className="w-full bg-white text-black py-4 rounded-xl font-semibold disabled:opacity-50 transition"
                >
                  {loading ? "Connecting..." : "Join Secure Call"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      <AnimatePresence>
        {showApprovalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative bg-[#111] w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
              <button
                className="absolute top-4 right-4 text-gray-400"
                onClick={() => setShowApprovalModal(false)}
              >
                <X size={16} />
              </button>
              <h2 className="text-lg font-semibold mb-4">Confirm Approval</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 border border-white/20 rounded-xl py-2 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl py-2 transition disabled:opacity-40"
                  disabled={aLoading}
                  onClick={handleApprove}
                >
                  {aLoading ? "Processing..." : "Approve"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative bg-[#111] w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
              <button
                className="absolute top-4 right-4 text-gray-400"
                onClick={() => setShowRejectionModal(false)}
              >
                <X size={16} />
              </button>
              <h2 className="text-lg font-semibold mb-4">Reject Partner</h2>
              <textarea
                value={reason}
                placeholder="Give rejection reason (required)"
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl p-3 mb-4 text-sm resize-none"
                rows={4}
              />
              <div className="flex gap-4">
                <button
                  onClick={() => setShowRejectionModal(false)}
                  className="flex-1 border border-white/20 rounded-xl py-2 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl py-2 transition disabled:opacity-40"
                  disabled={rLoading || !reason.trim()}
                  onClick={handleReject}
                >
                  {rLoading ? "Processing..." : "Reject"}
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
