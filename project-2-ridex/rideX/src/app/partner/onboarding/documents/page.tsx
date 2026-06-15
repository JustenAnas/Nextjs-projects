"use client";

import axios from "axios";
import { ArrowLeft, CircleDashed, FileCheck, UploadCloud } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type docsType = "aadhar" | "pancard" | "license" | "rc";

const docFields: { key: docsType; label: string; description: string }[] = [
  {
    key: "aadhar",
    label: "Aadhaar / ID Proof",
    description: "Government issued ID",
  },
  {
    key: "pancard",
    label: "Pancard / ID Proof",
    description: "Government issued ID",
  },
  {
    key: "license",
    label: "Driving License",
    description: "Valid driving license",
  },
  { key: "rc", label: "Vehicle RC", description: "Registration Certificate" },
];

const Page = () => {
  const router = useRouter();

  const [docs, setDocs] = useState<Record<docsType, File | null>>({
    aadhar: null,
    pancard: null,
    license: null,
    rc: null,
  });

  const [uploadedDocs, setUploadedDocs] = useState<Record<docsType, boolean>>({
    aadhar: false,
    pancard: false,
    license: false,
    rc: false,
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    axios
      .get("/api/partner/onboarding/documents")
      .then(({ data }) => {
        setUploadedDocs({
          aadhar: !!data.aadhar,
          pancard: !!data.pancard,
          license: !!data.license,
          rc: !!data.rc,
        });
      })
      .catch(() => {});
  }, []);

  const isAllUploaded =
    (docs.aadhar || uploadedDocs.aadhar) &&
    (docs.pancard || uploadedDocs.pancard) &&
    (docs.license || uploadedDocs.license) &&
    (docs.rc || uploadedDocs.rc);

  const handleDocs = async () => {
    setErr("");

    if (!isAllUploaded) {
      setErr("Please upload all documents");
      return;
    }

    try {
      const formData = new FormData();

      if (docs.aadhar) formData.append("aadhar", docs.aadhar);
      if (docs.pancard) formData.append("pancard", docs.pancard);
      if (docs.license) formData.append("license", docs.license);
      if (docs.rc) formData.append("rc", docs.rc);

      setLoading(true);

      await axios.post("/api/partner/onboarding/documents", formData);
      setLoading(false);
      // router.push("/partner/onboarding/bank");
      router.push("/");
    } catch (error: any) {
      setErr(error?.response?.data?.message ?? "something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleImage = (doc: docsType, file: File | null) => {
    if (!file) return;
    setDocs((prev) => ({ ...prev, [doc]: file }));
  };

  return (
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

          <p className="text-xs text-gray-500 font-medium">Step 2 of 3</p>
          <h1 className="text-2xl font-medium mt-1">Vehicle Documents</h1>
          <p className="text-sm text-gray-500 mt-2">
            Required for verification
          </p>
        </div>

        <div className="mt-8 space-y-5">
          {docFields.map(({ key, label, description }) => {
            const newFile = docs[key];
            const alreadySaved = uploadedDocs[key];

            return (
              <motion.label
                key={key}
                whileHover={{ scale: 1.02 }}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl border cursor-pointer transition
                  ${
                    newFile || alreadySaved
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-black"
                  }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {newFile
                      ? newFile.name
                      : alreadySaved
                        ? "Already uploaded — tap to replace"
                        : description}
                  </p>
                </div>

                <div className="flex flex-col items-center ml-4 shrink-0">
                  <span
                    className={`text-xs mb-1 ${newFile || alreadySaved ? "text-green-600" : "text-gray-400"}`}
                  >
                    {newFile ? "Uploaded" : alreadySaved ? "Saved" : "Upload"}
                  </span>

                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition
                    ${newFile || alreadySaved ? "bg-green-500" : "bg-black"}`}
                  >
                    {newFile || alreadySaved ? (
                      <FileCheck size={14} />
                    ) : (
                      <UploadCloud size={14} />
                    )}
                  </div>
                </div>

                <input
                  type="file"
                  hidden
                  accept="image/*,.pdf"
                  onChange={(e) =>
                    handleImage(key, e.target.files?.[0] || null)
                  }
                />
              </motion.label>
            );
          })}
        </div>

        <div className="mt-6 flex items-start gap-3 text-xs text-gray-500">
          <FileCheck size={14} className="mt-0.5 shrink-0" />
          <p>
            Documents are securely stored and manually verified by our team.
          </p>
        </div>

        {err && <p className="text-red-500 mt-4 text-sm">*{err}</p>}

        <motion.button
          whileHover={{ scale: isAllUploaded && !loading ? 1.02 : 1 }}
          whileTap={{ scale: isAllUploaded && !loading ? 0.97 : 1 }}
          disabled={loading || !isAllUploaded}
          className="mt-8 w-full h-14 rounded-2xl bg-black text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition"
          onClick={handleDocs}
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
