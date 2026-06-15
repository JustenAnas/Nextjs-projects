"use client";

import { IVehicle } from "@/models/vehicle.model";
import axios from "axios";
import { ImagePlus, IndianRupee } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PropsType = {
  open: boolean;
  onClose: () => void;
  data: IVehicle | null;
};

function PricingModal({ open, onClose, data }: PropsType) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [baseFare, setBaseFare] = useState("");
  const [pricePerKm, setPricePerKm] = useState("");
  const [waitingCharge, setWaitingCharge] = useState("");
  const [loading, setloading] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (data) {
      setPreview(data?.imageUrl || null);
      setBaseFare(data.baseFare?.toString() || "");
      setPricePerKm(data.pricePerKm?.toString() || "");
      setWaitingCharge(data.waitingCharge?.toString() || "");
    }
  }, [data]);

  const handleSubmit = async () => {
    setloading(true);
    try {
      const formData = new FormData();
      formData.append("baseFare", baseFare);
      formData.append("pricePerKm", pricePerKm);
      formData.append("waitingCharge", waitingCharge);
      if (image) {
        formData.append("image", image);
      }

      const { data } = await axios.post(
        "/api/partner/onboarding/pricing",
        formData
      );
      console.log(data);
      setloading(false);
      onClose();
    } catch (error: any) {
      console.log(error.response.data.message ?? error);
      setloading(false);
    }
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 bakdrop-blur-sm flex items-center justify-center z-50 px-4"
        >
          <motion.div
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Pricing and Vehciles Image</h2>
            </div>
            <div className="p-6 space-y-6">
              <label
                htmlFor="imageLabel"
                className="relative h-44 border-2 border-dashed rounded-2xl flex items-center justify-center cursor-pointer"
              >
                {!preview ? (
                  <ImagePlus size={28} />
                ) : (
                  <img
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                    src={preview}
                    alt="img"
                  />
                )}
                <input
                  type="file"
                  id="imageLabel"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setImage(e.target.files[0]);
                      setPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
              </label>
              <div>
                <p className="text-sm font-semibold mb-1 ">Base Fare</p>
                <div className="flex items-center gap-2 border rounded-xl px-4 py-3 bg-white">
                  <IndianRupee size={18} />
                  <input
                    placeholder="base fare"
                    className="w-full outline-none"
                    type="text"
                    value={baseFare}
                    onChange={(e) => setBaseFare(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-1 ">Price per KM</p>
                <div className="flex items-center gap-2 border rounded-xl px-4 py-3 bg-white">
                  <IndianRupee size={18} />
                  <input
                    placeholder="Price per KM"
                    className="w-full outline-none"
                    type="text"
                    value={pricePerKm}
                    onChange={(e) => setPricePerKm(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-1 ">Waiting Charge</p>
                <div className="flex items-center gap-2 border rounded-xl px-4 py-3 bg-white">
                  <IndianRupee size={18} />
                  <input
                    placeholder="Waiting Charge"
                    className="w-full outline-none"
                    type="text"
                    value={waitingCharge}
                    onChange={(e) => setWaitingCharge(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 flex gap-3">
              <button
                className="flex-1 border rounded-xl py-2"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                disabled={loading}
                className="flex-1 bg-black text-white rounded-xl py-2 disabled:opacity-40"
                onClick={handleSubmit}
              >
                {loading ? "Saving..." : "Submit"}
              </button>
            </div>{" "}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PricingModal;
