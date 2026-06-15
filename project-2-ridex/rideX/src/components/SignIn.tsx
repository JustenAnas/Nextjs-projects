"use client";
import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { CircleDashed, LockIcon, Mail, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";

type propType = {
  open: boolean;
  onClose: () => void;
};
type stepType = "login" | "signup" | "otp" | "forgot" | "reset";

export function SignIn({ open, onClose }: propType) {
  const [step, setStep] = useState<stepType>("login");
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(600);
  const [resetPassword, setResetPassword] = useState("");

  useEffect(() => {
    if (step !== "otp") return;
    setCountdown(600);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSignUp = async () => {
    setLoading(true);
    setErr("");
    try {
      const { data } = await axios.post("/api/auth/register", {
        username,
        email,
        password,
      });
      setPassword("");
      // setEmail("");
      setUserName("");
      setLoading(false);
      setStep("otp");
    } catch (err: any) {
      setErr(err.response?.data?.message || "something went wrong");
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setErr("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setPassword("");
    setEmail("");

    setLoading(false);

    if (res?.error) {
      setErr(res.error || "Invalid credentials");
      return;
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl: "/" });
  };
  const handleFacebookSignIn = async () => {
    await signIn("facebook", { callbackUrl: "/" });
  };
  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value) {
      if (index < otp.length - 1) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    } else {
      if (index > 0) {
        document.getElementById(`otp-${index - 1}`)?.focus();
      }
    }
  };

  const handleVerifyEmail = async () => {
    setLoading(true);
    setErr("");

    const finalOtp = otp.join("");

    if (!email || finalOtp.length !== 6) {
      setErr("Enter valid OTP");
      setLoading(false);
      return;
    }

    try {
      await axios.post("/api/auth/verify-email", {
        email,
        otp: finalOtp,
      });
      setOtp(["", "", "", "", "", ""]);
      setStep("login");
    } catch (err: any) {
      setErr(err.response?.data?.message || "something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-90 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="fixed inset-0 z-100 flex items-center justify-center px-4"
            >
              <div className="relative w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-[0_40px_100px_rgba(0,0,0,.35)] p-6 sm:p-8 text-black">
                <div
                  className="absolute right-4 top-2 text-gray-500 hover:text-black transition"
                  onClick={onClose}
                >
                  <X size={20} />
                </div>
                <div className="mb-4 text-center">
                  <h1 className="text-3xl font-extrabold tracking-widest">
                    RideX
                  </h1>
                  <p className="mt-1 text-xs text-gray-500">
                    Premium Vehicles Booking
                  </p>
                </div>
                <button
                  className="w-full h-11 rounded-xl border border-black/20 flex items-center justify-center gap-3 text-sm font-semibold transition cursor-pointer hover:bg-black hover:text-white shadow-[0_10px_25px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.25)]"
                  onClick={handleGoogleSignIn}
                >
                  <Image
                    src={"/google.png"}
                    alt="google"
                    width={25}
                    height={25}
                  />
                  Sign in with Google
                </button>
                <button
                  className="w-full h-11 mt-5 rounded-xl border border-black/20 flex items-center cursor-pointer justify-center gap-3 text-sm font-semibold transition hover:bg-black hover:text-white shadow-[0_10px_25px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.25)]"
                  onClick={handleFacebookSignIn}
                >
                  <Image
                    src={"/Facebook_Logo_.png"}
                    alt="facebook"
                    width={25}
                    height={25}
                  />
                  Sign in with Facebook
                </button>

                <div className="flex items-center gap-4 my-6 ">
                  <div className="flex-1 h-px bg-black/10" />
                  <div className="text-xs text-gray-500">OR</div>
                  <div className="flex-1 h-px bg-black/10" />
                </div>

                <div>
                  {step == "login" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <h1 className="text-xl text-center font-semibold">
                        Welcome Back
                      </h1>
                      <div className="mt-5 space-y-4">
                        <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                          <Mail size={18} className="text-gray-500" />
                          <input
                            type="text"
                            placeholder="Email"
                            className="w-full  bg-transparent outline-none text-sm"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                          />
                        </div>
                        <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                          <LockIcon size={18} className="text-gray-500" />
                          <input
                            type="password"
                            placeholder="Password"
                            className="w-full  bg-transparent outline-none text-sm"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                          />
                        </div>
                        <p
                          className="text-xs text-right text-blue-600 cursor-pointer hover:underline"
                          onClick={() => {
                            setStep("forgot");
                            setErr("");
                          }}
                        >
                          Forgot Password?
                        </p>
                        <button
                          className="w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 cursor-pointer transition"
                          disabled={loading}
                          onClick={handleLogin}
                        >
                          {!loading ? (
                            "Login"
                          ) : (
                            <div className="flex items-center justify-center">
                              <CircleDashed
                                size={18}
                                color="white"
                                className="animate-spin"
                              />
                            </div>
                          )}
                        </button>
                      </div>
                      <p className="mt-6 text-center text-sm text-gray-500">
                        Don't have an account?
                        <span
                          onClick={() => {
                            setStep("signup");
                            setErr("");
                          }}
                          className="text-blue-600 font-medium hover:underline cursor-pointer"
                        >
                          Sign Up
                        </span>
                      </p>
                    </motion.div>
                  )}
                  {step == "signup" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <h1 className="text-xl text-center font-semibold">
                        Create an Account
                      </h1>
                      <div className="mt-5 space-y-4">
                        <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                          <User size={18} className="text-gray-500" />
                          <input
                            type="text"
                            placeholder="Username"
                            className="w-full  bg-transparent outline-none text-sm"
                            onChange={(e) => setUserName(e.target.value)}
                            value={username}
                          />
                        </div>
                        <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                          <Mail size={18} className="text-gray-500" />
                          <input
                            type="text"
                            placeholder="Email"
                            className="w-full  bg-transparent outline-none text-sm"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                          />
                        </div>
                        <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                          <LockIcon size={18} className="text-gray-500" />
                          <input
                            type="password"
                            placeholder="Password"
                            className="w-full  bg-transparent outline-none text-sm"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                          />
                        </div>
                        {err && <p className="text-red-500 text-sm">*{err}</p>}
                        <button
                          className="w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition cursor-pointer"
                          disabled={loading}
                          onClick={handleSignUp}
                        >
                          {!loading ? (
                            "Send OTP"
                          ) : (
                            <div className="flex items-center justify-center">
                              <CircleDashed
                                size={18}
                                color="white"
                                className="animate-spin"
                              />
                            </div>
                          )}
                        </button>
                      </div>
                      <p className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?
                        <span
                          onClick={() => {
                            setStep("login");
                            setErr("");
                          }}
                          className="text-blue-600 font-medium hover:underline cursor-pointer"
                        >
                          Login
                        </span>
                      </p>
                    </motion.div>
                  )}
                  {step === "otp" && (
                    <motion.div
                      key="otp"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h2 className="text-xl text-center font-semibold">
                        Verify Your Email
                      </h2>

                      <div className="mt-6 flex justify-between gap-2">
                        {otp.map((digitCounter, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            value={digitCounter}
                            maxLength={1}
                            type="text"
                            className="w-10 h-12 sm:w-12 text-center text-lg font-semibold rounded-xl bg-white border border-black/20 outline-none"
                            onChange={(e) => {
                              handleOtpChange(index, e.target.value);
                            }}
                          />
                        ))}
                      </div>
                      <p className="mt-3 text-center text-xs text-gray-400">
                        {countdown > 0 ? (
                          <>
                            OTP expires in{" "}
                            <span
                              className={`font-semibold ${countdown < 60 ? "text-red-500" : "text-black"}`}
                            >
                              {formatTime(countdown)}
                            </span>
                          </>
                        ) : (
                          <span className="text-red-500 font-medium">
                            OTP expired.{" "}
                            <span
                              onClick={handleSignUp}
                              className="underline cursor-pointer hover:text-red-700"
                            >
                              Resend
                            </span>
                          </span>
                        )}
                      </p>
                      {err && (
                        <p className="text-red-500 mt-3 text-sm text-center">
                          {err}
                        </p>
                      )}

                      <button
                        className="mt-6 w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition cursor-pointer flex items-center justify-center"
                        disabled={loading}
                        onClick={handleVerifyEmail}
                      >
                        {!loading ? (
                          "Verify and Create Account"
                        ) : (
                          <div className="flex items-center justify-center">
                            <CircleDashed
                              size={18}
                              color="white"
                              className="animate-spin"
                            />
                          </div>
                        )}
                      </button>
                    </motion.div>
                  )}
                  {step === "forgot" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <h1 className="text-xl text-center font-semibold">
                        Reset Password
                      </h1>

                      <div className="mt-5 space-y-4">
                        <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                          <Mail size={18} className="text-gray-500" />
                          <input
                            type="text"
                            placeholder="Enter your email"
                            className="w-full bg-transparent outline-none text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>

                        <button
                          className="w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900"
                          onClick={async () => {
                            setLoading(true);
                            setErr("");
                            try {
                              await axios.post(
                                "/api/auth/forget-password/request",
                                {
                                  email,
                                }
                              );
                              setStep("reset");
                            } catch (err: any) {
                              setErr(err.response?.data?.message);
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          Send OTP
                        </button>

                        <p
                          className="text-center text-sm text-blue-600 cursor-pointer"
                          onClick={() => setStep("login")}
                        >
                          Back to Login
                        </p>
                      </div>
                    </motion.div>
                  )}
                  {step === "reset" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <h1 className="text-xl text-center font-semibold">
                        Enter OTP + New Password
                      </h1>

                      <div className="mt-5 space-y-4">
                        {/* OTP */}
                        <div className="flex justify-between gap-2">
                          {otp.map((val, i) => (
                            <input
                              key={i}
                              id={`otp-${i}`}
                              value={val}
                              maxLength={1}
                              className="w-10 h-12 text-center border rounded-xl"
                              onChange={(e) =>
                                handleOtpChange(i, e.target.value)
                              }
                            />
                          ))}
                        </div>

                        {/* New Password */}
                        <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                          <LockIcon size={18} className="text-gray-500" />
                          <input
                            type="password"
                            placeholder="New Password"
                            className="w-full bg-transparent outline-none text-sm"
                            value={resetPassword}
                            onChange={(e) => setResetPassword(e.target.value)}
                          />
                        </div>

                        <button
                          className="w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900"
                          onClick={async () => {
                            setStep("login");
                            setLoading(true);
                            setErr("");

                            const finalOtp = otp.join("");

                            try {
                              await axios.post(
                                "/api/auth/forget-password/verify-otp",
                                {
                                  email,
                                  otp: finalOtp,
                                }
                              );

                              await axios.post(
                                "/api/auth/forget-password/reset-password",
                                {
                                  email,
                                  newPassword: resetPassword,
                                }
                              );

                              setStep("login");
                              setOtp(["", "", "", "", "", ""]);
                              setResetPassword("");
                            } catch (err: any) {
                              setErr(err.response?.data?.message);
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          Reset Password
                        </button>

                        <p
                          className="text-center text-sm text-blue-600 cursor-pointer"
                          onClick={() => setStep("login")}
                        >
                          Back to Login
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
