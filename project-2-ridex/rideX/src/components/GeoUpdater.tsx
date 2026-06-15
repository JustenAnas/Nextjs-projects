"use client";
import { getSocket } from "@/lib/socket";
import { useEffect, useRef } from "react";

function GeoUpdater({ userId }: { userId: string }) {
  const socketRef = useRef<any>(null);
  useEffect(() => {
    if (!userId) return;
    if (!navigator.geolocation) return;

    const s = getSocket();
    socketRef.current = s;

    const register = () => s.emit("identity", userId);
    if (s.connected) {
      register();
    } else {
      s.once("connect", register);
    }

    const watcher = navigator.geolocation.watchPosition(
      ({ coords }) => {
        socketRef.current.emit("update-location", {
          userId,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      },
      (err) => {
        console.log(err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
      }
    );
    return () => {
      socketRef.current?.off("connect", register);
      navigator.geolocation.clearWatch(watcher);
    };
  }, [userId]);

  return null;
}

export default GeoUpdater;
