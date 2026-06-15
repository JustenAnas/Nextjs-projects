"use client";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SignIn } from "./SignIn";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  Car,
  ChevronRight,
  LogOut,
  Menu,
  Motorbike,
  Truck,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { setUserData } from "@/redux/userSlice";
import axios from "axios";
import { getSocket } from "@/lib/socket";

const Nav_Items = ["Home", "Bookings", "Contact", "About Us"];
const Navbar = () => {
  const pathName = usePathname();
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { userData } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    dispatch(setUserData(null));
    setProfileOpen(false);
  };

  const fetchCount = async () => {
    try {
      const { data } = await axios.get(
        "/api/partner/booking/pending-requests-count"
      );

      console.log(data);
      setPendingCount(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userData?.role === "partner") {
      fetchCount();
    }
  }, [userData?.role]);

  useEffect(() => {
    const socket = getSocket();
    socket.on("new-booking", (data) => {
      setPendingCount((prev) => prev + 1);
      console.log(data);
    });
    return () => {
      socket.off("new-booking");
    };
  }, []);

  return (
    <>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-3 left-1/2 -translate-x-1/2 w-[94%] md:w-[86%] z-50 rounded-full bg-[#0b0b0b] text-white shadow-[0_15px_50px_rgba(0,0,0,0.7)] py-3`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <Image src={"/logo.png"} alt="logo" width={44} height={44} priority />
          <div className="hidden md:flex items-center gap-10">
            {userData?.role === "partner" ? (
              <>
                <Link
                  className="relative text-sm font-medium text-gray-300 hover:text-white transition"
                  href={"/"}
                >
                  Home
                </Link>
                <Link
                  className="relative text-sm font-medium text-gray-300 hover:text-white transition"
                  href={"/partner/pending"}
                >
                  Pending Request
                  <span className="absolute -top-2 -right-5 w-5 h-5 bg-[rgba(237,0,255,1)] text-white text-xs rounded-full flex items-center justify-center  font-bold">
                    {pendingCount ?? 0}
                  </span>
                </Link>
                <Link
                  className="relative text-sm font-medium text-gray-300 hover:text-white transition"
                  href={"/partner/bookings"}
                >
                  Bookings{" "}
                </Link>
                <Link
                  className="relative text-sm font-medium text-gray-300 hover:text-white transition"
                  href={"/partner/active-ride"}
                >
                  Active Ride
                </Link>
              </>
            ) : (
              Nav_Items.map((item, index) => {
                let href;
                if (item === "Home") {
                  href = "/";
                } else {
                  href = `/user/${item.toLowerCase()}`;
                }

                const active = href === pathName;
                return (
                  <Link
                    key={index}
                    href={href}
                    className={`text-sm  font-medium transition
            ${active ? "text-white" : "text-gray-400 hover:text-white"}
            }`}
                  >
                    {item}
                  </Link>
                );
              })
            )}
          </div>
          <div className="flex items-center gap-3 relative">
            <div className="hidden md:block relative">
              {!userData ? (
                <button
                  className="px-4 py-1.5 rounded-full bg-white text-black text-sm"
                  onClick={() => {
                    setAuthOpen(true);
                  }}
                >
                  Login
                </button>
              ) : (
                <>
                  <button
                    className="w-11 h-11 rounded-full bg-white text-black font-bold text-xl"
                    onClick={() => setProfileOpen((p) => !p)}
                  >
                    {userData.username.charAt(0).toUpperCase()}
                  </button>
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-14 right-0 w-75 bg-white text-black rounded-2xl shadow-xl border"
                      >
                        <div className="p-5">
                          <p className="font-bold  text-lg">
                            {userData.username}
                          </p>
                          <p className="text-sm font-extrabold text-gray-500 mb-4">
                            {userData.role}
                          </p>
                          {userData.role != "partner" && (
                            <div
                              className="w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl"
                              onClick={() =>
                                router.push("/partner/onboarding/vehicle")
                              }
                            >
                              <div className="flex space-x-2">
                                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                                  <Motorbike size={14} />
                                </div>
                                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                                  <Car size={14} />
                                </div>
                                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                                  <Truck size={14} />
                                </div>
                              </div>
                              Become A Partner
                              <ChevronRight size={16} className="ml-auto" />
                            </div>
                          )}
                          <button
                            className="w-full flex items-center gap-3 py-3 hover:bg-gray-100 font-semibold rounded-xl mt-2"
                            onClick={handleLogout}
                          >
                            <LogOut size={16} />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>

            {/* for mobile */}
            <div className="md:hidden ">
              {!userData ? (
                <button
                  className="px-4 py-1.5 rounded-full bg-white text-black text-sm"
                  onClick={() => {
                    setAuthOpen(true);
                  }}
                >
                  Login
                </button>
              ) : (
                <>
                  <button
                    className="w-11 h-11 rounded-full bg-white text-black font-bold text-xl"
                    onClick={() => setProfileOpen((p) => !p)}
                  >
                    {userData.username.charAt(0).toUpperCase()}
                  </button>
                </>
              )}
            </div>
            <button
              className="md:hidden text-white"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black z-30 md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-21.25 left-1/2 -translate-x-1/2 w-[92%] bg-[#0b0b0b] rounded-2xl shadow-2xl z-40 md:hidden overflow-hidden"
            >
              <div className="flex flex-col divide-y divide-white/10">
                {Nav_Items.map((item, index) => {
                  let href;
                  if (item === "Home") {
                    href = "/";
                  } else {
                    href = `/${item.toLowerCase()}`;
                  }

                  return (
                    <Link
                      key={index}
                      href={href}
                      className="px-6 py-4 text-gray-300 hover:bg-white/5"
                    >
                      {item}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {profileOpen && userData && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setProfileOpen(false)}
              className="fixed inset-0 bg-black z-30 md:hidden"
            />
            <motion.div
              initial={{ y: 400 }}
              animate={{ y: 0 }}
              exit={{ y: 400 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-50 md:hidden"
            >
              <div className="p-5">
                <p className="font-bold  text-lg">{userData.username}</p>
                <p className="text-sm font-extrabold text-gray-500 mb-4">
                  {userData.role}
                </p>
                {userData.role != "partner" && (
                  <div
                    className="w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl"
                    onClick={() => router.push("/partner/onboarding/vehicle")}
                  >
                    <div className="flex space-x-2">
                      <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                        <Motorbike size={14} />
                      </div>
                      <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                        <Car size={14} />
                      </div>
                      <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                        <Truck size={14} />
                      </div>
                    </div>
                    Become A Partner
                    <ChevronRight size={16} className="ml-auto" />
                  </div>
                )}
                <button
                  className="w-full flex items-center gap-3 py-3 hover:bg-gray-100 font-semibold rounded-xl mt-2"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SignIn
        open={authOpen}
        onClose={() => {
          setAuthOpen(false);
        }}
      />
      {/* AuthModal */}
    </>
  );
};

export default Navbar;
