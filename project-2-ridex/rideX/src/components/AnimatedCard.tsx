"use client";

import { motion } from "motion/react";

const AnimatedCard = ({ title, icon, children }: any) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-whhite rounded-[32xl] p-8 shadow-xl space-y-6"
    >
      <div className="flex items-center gap-2 font-semibold">
        {icon}
        {title}
      </div>
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
