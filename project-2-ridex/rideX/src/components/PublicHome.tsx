"use client";
import { useState } from "react";
import HeroSection from "./HeroSection";
import { SignIn } from "./SignIn";
import VehicleSlider from "./VehicleSlider";

const PublicHome = () => {
  const [authOpen, setAuthOpen] = useState(false);
  return (
    <>
      <HeroSection onAuthRequired={() => setAuthOpen(true)} />
      <VehicleSlider />
      <SignIn open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default PublicHome;
