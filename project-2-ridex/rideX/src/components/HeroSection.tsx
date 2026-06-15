"use client";
import { getSocket } from "@/lib/socket";
import { RootState } from "@/redux/store";
import { Bike, Bus, Car, Motorbike, Truck, Van } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

import { useSelector } from "react-redux";
const HeroSection = ({ onAuthRequired }: { onAuthRequired: () => void }) => {
  const { userData } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/heroImage.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/75" />
        <div>
          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white font-extrabold text-4xl sm:text-5xl md:text-7xl"
            >
              Book Any Vehcile
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 max-w-xl text-gray-300"
            >
              From cars to bikes to trucks, we have it all. Experience seamless
              booking and unforgettable journeys with us.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
              className="mt-8 flex gap-8 text-gray-300"
            >
              <Bike size={30} />
              <Motorbike size={30} />
              <Car size={30} />
              <Van size={30} />
              <Bus size={30} />
              <Truck size={30} />
            </motion.div>
            <motion.button
              whileHover={{
                scale: 1.05,
                y: -3,
                boxShadow: "0px 10px 25px rgba(0,0,0,0.2)",
              }}
              whileTap={{
                scale: 0.96,
                y: 0,
                boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="mt-12 px-10 py-4 bg-white text-black rounded-full font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => {
                !userData ? onAuthRequired() : router.push("/user/book");
              }}
            >
              Book Now
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
