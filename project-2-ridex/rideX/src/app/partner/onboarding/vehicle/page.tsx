"use client";
import axios from "axios";
import {
  ArrowLeft,
  Bike,
  Bus,
  Car,
  CircleDashed,
  Motorbike,
  Truck,
  Van,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const vehicleTypes = [
  { id: "bike", label: "Bike", icon: <Bike />, description: "Two-wheeler" },
  {
    id: "motorcycle",
    label: "Motorcycle",
    icon: <Motorbike />,
    description: "Two-wheeler",
  },
  { id: "car", label: "Car", icon: <Car />, description: "Four-wheeler" },
  { id: "bus", label: "Bus", icon: <Bus />, description: "Large vehicle" },
  {
    id: "truck",
    label: "Truck",
    icon: <Truck />,
    description: "Heavy vehicle",
  },
  {
    id: "other",
    label: "Other",
    icon: <Van />,
    description: "Other types of vehicles",
  },
];

const Page = () => {
  const router = useRouter();
  const [vehicleType, setVehicleType] = useState("");
  const [vehcileNumber, setvehcileNumber] = useState("");
  const [vehcileModel, setvehcileModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleVehicle = async () => {
    setErr("");
    try {
      setLoading(true);
      const { data } = await axios.post("/api/partner/onboarding/vehicle", {
        type: vehicleType,
        vehicleModel: vehcileModel,
        licensePlate: vehcileNumber,
      });
      setLoading(false);
      // router.push("/partner/onboarding/documents"); // go to next step
      router.push("/");
    } catch (error: any) {
      setErr(error?.response?.data?.message ?? "something went wrong");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const handleGetVehicle = async () => {
      try {
        const { data } = await axios.get("/api/partner/onboarding/vehicle");
        setVehicleType(data.type);
        setvehcileModel(data.vehicleModel);
        setvehcileNumber(data.licensePlate);
      } catch (error: any) {
        console.log(error);
      }
    };
    handleGetVehicle();
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-white rounded-3xl border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-8"
      >
        <div className="relative text-center">
          <button
            className="absolute left-0 top-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
          </button>
          <p className="text-xs text-gray-500 font-medium">Step 1 of 3</p>
          <h1 className="text-2xl font-medium mt-1">Vehicle Details</h1>
          <p className="text-sm text-gray-500 mt-2">
            Add your vehicle details to get started
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-3">
              Vehicle Type
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {vehicleTypes.map((vehicle) => {
                const active = vehicleType === vehicle.id;
                return (
                  <motion.div
                    key={vehicle.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setVehicleType(vehicle.id)}
                    className={`rounded-2xl border p-4 flex flex-col items-center gap-2 cursor-pointer transition
                    ${active ? "bg-black text-white border-black" : "border-gray-200 hover:border-black"}`}
                  >
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center
                      ${active ? "bg-white text-black" : "bg-black text-white"}`}
                    >
                      {vehicle.icon}
                    </div>
                    <div className="text-sm font-semibold">{vehicle.label}</div>
                    <p
                      className={`text-xs ${active ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {vehicle.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="vn" className="text-xs font-semibold text-gray-500">
            Vehicle Number
          </label>
          <input
            onChange={(e) => setvehcileNumber(e.target.value.toUpperCase())}
            value={vehcileNumber}
            type="text"
            placeholder="UP12AB1234"
            id="vn"
            className="mt-2 w-full border-b border-gray-300 pb-2 text-sm focus:outline-none focus:border-black transition"
          />
        </div>

        <div className="mt-6">
          <label htmlFor="vm" className="text-xs font-semibold text-gray-500">
            Vehicle Model
          </label>
          <input
            onChange={(e) => setvehcileModel(e.target.value)}
            value={vehcileModel}
            type="text"
            placeholder="Tata Ace"
            id="vm"
            className="mt-2 w-full border-b border-gray-300 pb-2 text-sm focus:outline-none focus:border-black transition"
          />
        </div>

        {err && <p className="text-red-500 mt-4 text-sm">*{err}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className="mt-8 w-full h-14 rounded-2xl bg-black text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition"
          onClick={handleVehicle}
        >
          {loading ? (
            <CircleDashed className="text-white animate-spin" size={20} />
          ) : (
            "Continue"
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Page;
