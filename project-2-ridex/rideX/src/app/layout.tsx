import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Provider from "@/lib/Provider";
import ReduxProvider from "@/redux/ReduxProvider";
import InitUser from "@/InitUser";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RideX - Smart Vehicle Booking App for your daily commute",
  description:
    "Experience the future of commuting with RideX, the smart vehicle booking app designed to make your daily travel seamless and efficient. Whether you're heading to work, running errands, or exploring the city, RideX offers a convenient and eco-friendly solution for all your transportation needs. With real-time availability, easy booking, and a fleet of electric vehicles, RideX is your go-to app for a smarter, greener commute. Join us in revolutionizing the way you travel and enjoy the benefits of a more sustainable lifestyle with RideX.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Toaster position="bottom-center" />
        <Provider>
          <ReduxProvider>
            <InitUser />
            {children}
          </ReduxProvider>
        </Provider>
      </body>
    </html>
  );
}
