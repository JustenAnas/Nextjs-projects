import { auth } from "@/auth";
import AdminDashboard from "@/components/AdminDashboard";
import Footer from "@/components/Footer";
import GeoUpdater from "@/components/GeoUpdater";
import Navbar from "@/components/Navbar";
import PartnerDashboard from "@/components/PartnerDashboard";
import PublicHome from "@/components/PublicHome";
import connectDB from "@/lib/db";
import User from "@/models/user.model";

const page = async () => {
  const session = await auth();
  console.log("session:", session);

  await connectDB();
  const user = await User.findOne({ email: session?.user?.email });
  if (!user)
    return (
      <div className="w-full min-h-screen bg-white">
        <PublicHome />
        <Footer />
      </div>
    );
  return (
    <div className="w-full min-h-screen bg-white">
      <GeoUpdater userId={String(user._id)} />
      {user?.role == "partner" ? (
        <>
          <Navbar />
          <PartnerDashboard />
        </>
      ) : user?.role == "admin" ? (
        <AdminDashboard />
      ) : (
        <>
          <Navbar />
          <PublicHome />
        </>
      )}
      <Footer />
    </div>
  );
};

export default page;
