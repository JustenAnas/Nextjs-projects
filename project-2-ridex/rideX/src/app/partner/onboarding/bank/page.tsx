"use client";

import axios from "axios";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle,
  CircleDashed,
  CreditCard,
  Landmark,
  Phone,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ACCOUNT_REGEX = /^\d{9,18}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const UPI_REGEX = /^[\w.\-]{3,}@[a-zA-Z]{3,}$/;

const Page = () => {
  const router = useRouter();
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setaccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [upiId, setUpiId] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nameValid = accountHolderName.trim().length > 2;
  const accountValid = ACCOUNT_REGEX.test(accountNumber);
  const ifscValid = IFSC_REGEX.test(ifscCode.toUpperCase());
  const mobileValid = MOBILE_REGEX.test(mobileNo);
  const upiValid = upiId.length === 0 || UPI_REGEX.test(upiId);

  const inputClass = (valid: boolean, value: string) =>
    `flex-1 border-b pb-2 text-sm focus:outline-none transition ${
      value.length > 0
        ? valid
          ? "border-green-500"
          : "border-red-400"
        : "border-gray-300 focus:border-black"
    }`;

  const iconClass = (valid: boolean, value: string) =>
    `transition ${
      value.length > 0
        ? valid
          ? "text-green-500"
          : "text-red-400"
        : "text-gray-400"
    }`;

  const handleBank = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post("/api/partner/onboarding/bank", {
        accountHolderName,
        accountNumber,
        ifscCode: ifscCode.toUpperCase(),
        upi: upiId,
        mobileNumber: mobileNo,
      });
      
      setLoading(false);
      router.push("/");
      // router.push("/partner"); // ← only change
    } catch (error: any) {
      setError(error?.response?.data?.message || "something went wrong");
      console.log(error);
      setLoading(false);
    }
  };
  useEffect(() => {
    const handleGetBank = async () => {
      try {
        const { data } = await axios.get("/api/partner/onboarding/bank");
        setAccountHolderName(data.partnerBank.accountHolderName);
        setaccountNumber(data.partnerBank.accountNumber);
        setIfscCode(data.partnerBank.ifscCode);
        setMobileNo(data.mobileNumber);
        setUpiId(data.partnerBank.upi);
      } catch (error: any) {
        console.log(error);
      }
    };
    handleGetBank();
  }, []);

  return (
    <div>
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
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
            <p className="text-xs text-gray-500 font-medium">Step 3 of 3</p>
            <h1 className="text-2xl font-medium mt-1">Banking Details</h1>
            <p className="text-sm text-gray-500 mt-2">
              Used for partner payouts
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="ahn"
                className="text-xs font-semibold text-gray-500"
              >
                Account holder name
              </label>
              <div className="flex items-center gap-2 mt-2">
                <div className={iconClass(nameValid, accountHolderName)}>
                  <BadgeCheck />
                </div>
                <input
                  id="ahn"
                  type="text"
                  placeholder="As per bank records"
                  className={inputClass(nameValid, accountHolderName)}
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                />
              </div>
              {accountHolderName.length > 0 && !nameValid && (
                <p className="text-red-400 text-xs mt-1 ml-7">
                  Name must be at least 3 characters
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="an"
                className="text-xs font-semibold text-gray-500"
              >
                Bank Account Number
              </label>
              <div className="flex items-center gap-2 mt-2">
                <div className={iconClass(accountValid, accountNumber)}>
                  <CreditCard />
                </div>
                <input
                  id="an"
                  type="text"
                  placeholder="Enter youre account number"
                  className={inputClass(accountValid, accountNumber)}
                  value={accountNumber}
                  onChange={(e) => setaccountNumber(e.target.value)}
                />
              </div>
              {accountNumber.length > 0 && !accountValid && (
                <p className="text-red-400 text-xs mt-1 ml-7">
                  Account number must be 9-18 digits
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="ic"
                className="text-xs font-semibold text-gray-500"
              >
                IFSC code
              </label>
              <div className="flex items-center gap-2 mt-2">
                <div className={iconClass(ifscValid, ifscCode)}>
                  <Landmark />
                </div>
                <input
                  id="ic"
                  type="text"
                  placeholder="SBIC00344742"
                  className={inputClass(ifscValid, ifscCode)}
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                />
              </div>
              {ifscCode.length > 0 && !ifscValid && (
                <p className="text-red-400 text-xs mt-1 ml-7">
                  Invalid IFSC code e.g. SBIN0001234
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="mn"
                className="text-xs font-semibold text-gray-500"
              >
                Registered mobile number
              </label>
              <div className="flex items-center gap-2 mt-2">
                <div className={iconClass(mobileValid, mobileNo)}>
                  <Phone />
                </div>
                <input
                  id="mn"
                  type="text"
                  placeholder="Your registered number"
                  maxLength={10}
                  className={inputClass(mobileValid, mobileNo)}
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                />
              </div>
              {mobileNo.length > 0 && !mobileValid && (
                <p className="text-red-400 text-xs mt-1 ml-7">
                  Enter a valid 10 digit mobile number
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="upi"
                className="text-xs font-semibold text-gray-500"
              >
                UPI ID(optional)
              </label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  id="upi"
                  type="text"
                  placeholder="name@upi"
                  className={inputClass(upiValid, upiId)}
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
              {upiId.length > 0 && !upiValid && (
                <p className="text-red-400 text-xs mt-1">
                  Invalid UPI ID e.g. name@paytm
                </p>
              )}
            </div>
          </div>
          <div className="mt-6 flex items-start gap-3 text-xs text-gray-500">
            <CheckCircle size={14} className="mt-0.5" />
            <p>
              Bank details are verified before first payout. This usually takes
              24-48 hours.
            </p>
          </div>

          {error && <p className="text-red-500 mt-4 text-sm">*{error}</p>}

          <motion.button
            disabled={
              loading ||
              !nameValid ||
              !accountValid ||
              !ifscValid ||
              !mobileValid
            }
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="mt-8 w-full h-14 rounded-2xl bg-black text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition"
            onClick={handleBank}
          >
            {loading ? (
              <CircleDashed className="text-white animate-spin" size={20} />
            ) : (
              "Continue"
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Page;
