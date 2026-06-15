import {
  LayoutGrid,
  Bike,
  Car,
  Truck,
  Bus,
  BusFront,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";

const Vehicle_Items = [
  {
    title: "All Vehicles",
    desc: "Browse the full fleet",
    Icon: <LayoutGrid />,
    tag: "Popular",
  },
  {
    title: "Bikes",
    desc: "Fast & affordable rides",
    Icon: <Bike />,
    tag: "Trending",
  },
  {
    title: "Cars",
    desc: "Comfortable daily rides",
    Icon: <Car />,
    tag: "Top Rated",
  },
  {
    title: "SUVs",
    desc: "Spacious and versatile",
    Icon: <Truck />,
    tag: "New",
  },
  {
    title: "Vans",
    desc: "Perfect for groups",
    Icon: <Bus />,
    tag: "Short-Trip",
  },
  {
    title: "Trucks",
    desc: "Powerful and rugged",
    Icon: <Truck />,
    tag: "Heavy",
  },
  {
    title: "Buses",
    desc: "Budget group travel",
    Icon: <BusFront />,
    tag: "Long-Trip",
  },
];

const VehicleSlider = () => {
  const [hovered, setHovered] = useState<number | null>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: "left" | "right") => {
    if (!slideRef.current) return;
    slideRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };
  return (
    <div className="w-full bg-white py-20 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-8 bg-zinc-900" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Fleet
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 leading-none">
              Vehicles
              <br />
              <span className="relative inline-block">
                Categories
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-zinc-900 origin-left"
                />{" "}
              </span>
            </h2>
            <p className="text-zinc-400 text-sm mt-3 font-medium">
              Choose the ride that fits your needs
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <motion.div
              whileTap={{ scale: 0.88 }}
              onClick={() => scroll("left")}
              className="w-11 h-11 rounded-2xl border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-900 hover:border-zinc-900 hover:text-white disabled:opacity-25 disabled:hover:bg-white disabled:hover:text-zinc-900 disabled:hover:border-zinc-200 transition-all text-zinc-700 shadow-sm"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </motion.div>
            <motion.div
              whileTap={{ scale: 0.88 }}
              onClick={() => scroll("right")}
              className="w-11 h-11 rounded-2xl border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-900 hover:border-zinc-900 hover:text-white disabled:opacity-25 disabled:hover:bg-white disabled:hover:text-zinc-900 disabled:hover:border-zinc-200 transition-all text-zinc-700 shadow-sm"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </motion.div>
          </div>
        </motion.div>
        <div className="relative">
          <div
            ref={slideRef}
            className="flex gap-5 pt-20 overflow-x-auto scroll-smooth pb-4 px-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {Vehicle_Items.map((category, index) => {
              const isHovered = hovered === index;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1 + index * 0.08,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onHoverStart={() => setHovered(index)}
                  onHoverEnd={() => setHovered(null)}
                  whileHover={{ y: -8 }}
                  className="group relative min-w-55 sm:min-w-65  shrink-0 cursor-pointer"
                >
                  <motion.div
                    animate={{
                      backgroundColor: isHovered ? "#09090b" : "#ffffff",
                      borderColor: isHovered ? "09090b" : "e4e4e7",
                      boxShadow: isHovered
                        ? "0 24px 56px rgba(0,0,0,0.25)"
                        : "0 2px 16px rgba(0,0,0,0.06)",
                    }}
                    transition={{ duration: 0.25 }}
                    className="relative rounded-3xl border p-6 sm:p-7 overflow-hidden h-full"
                  >
                    <motion.div>
                      <Sparkles size={8} />
                      {category.tag}
                    </motion.div>
                    <motion.div
                      animate={{
                        backgroundColor: isHovered
                          ? "rgba(255,255,255,0.1)"
                          : "#f4f4f5",
                        borderColor: isHovered
                          ? "rgba(255,255,255,0.15)"
                          : "#e4e4e7",
                      }}
                      className="w-14 h-14 rounded-2xl border flex items-center justify-center mb-5 transition-colors"
                    >
                      <motion.div
                        animate={{ color: isHovered ? "#ffffff" : "#3f3f46" }}
                        transition={{ duration: 0.2 }}
                      >
                        {category.Icon}
                      </motion.div>
                    </motion.div>

                    <motion.h3
                      animate={{ color: isHovered ? "#ffffff" : "#09090b" }}
                      transition={{ duration: 0.2 }}
                      className="text-lg font-black tracking-tight leading-none mb-2"
                    >
                      {category.title}
                    </motion.h3>

                    <motion.p
                      animate={{
                        color: isHovered ? "rgba(255,255,255,0.5)" : "#a1a1aa",
                      }}
                      transition={{ duration: 0.2 }}
                      className="text-xs font-medium leading-relaxed"
                    >
                      {category.desc}
                    </motion.p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex iems-center gap-6 mt-8 pt-6 border-t border-zinc-100"
        >
          {[
            { num: "6+", label: "Categories" },
            { num: "10+", label: "Vehicle Options" },
            { num: "24/7", label: "Availability" },
          ].map((data, index) => (
            <div key={index} className="flex items-center gap-3">
              <p className="text-zinc-900 text-lg font-black tracking-tight">
                {data.num}
              </p>
              <p className="text-zinc-400 text-xs font-medium">{data.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default VehicleSlider;
