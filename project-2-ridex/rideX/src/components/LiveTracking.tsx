"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { MapContainer, Marker, Polyline, TileLayer } from "react-leaflet";
import L from "leaflet";

type Props = {
  driverLocation: [Number, Number] | null;
  pickUpLocation: [Number, Number] | null;
  dropLocation: [Number, Number] | null;
  mapStatus: "arriving" | "ongoing" | "completed";
  onStats: (data: {
    distanceToPickUp: number;
    etaToPickup: number;
    distanceToDrop: number;
    etaToDrop: number;
  }) => void;
};

const pickUpIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      display:flex;
      flex-direction:column;
      align-items:center;
      position:relative;
      transform:translateY(-8px);
    ">
      <div style="
        padding:5px 12px;
        border-radius:4px;
        background:#000000;
        color:white;
        font-size:10px;
        font-weight:700;
        letter-spacing:0.5px;
        text-transform:uppercase;
        box-shadow:0 6px 20px rgba(0,0,0,0.3);
      ">
        Pickup
      </div>
      <div style="
        width:2px;
        height:12px;
        background:#000000;
      "></div>
      <div style="
        position:relative;
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <div style="
          position:absolute;
          width:36px;
          height:36px;
          border-radius:50%;
          background:rgba(0,0,0,0.15);
          animation:pickupPulse 2s infinite ease-out;
        "></div>
        <div style="
          width:16px;
          height:16px;
          border-radius:50%;
          background:#000000;
          border:3px solid white;
          box-shadow:0 4px 12px rgba(0,0,0,0.3);
          position:relative;
          z-index:2;
        "></div>
      </div>
      <div style="
        position:absolute;
        bottom:-8px;
        width:14px;
        height:4px;
        background:rgba(0,0,0,0.2);
        border-radius:50%;
        filter:blur(3px);
      "></div>
    </div>
    <style>
      @keyframes pickupPulse {
        0% { transform:scale(0.5); opacity:1; }
        100% { transform:scale(1.6); opacity:0; }
      }
    </style>
  `,
  iconSize: [80, 50],
  iconAnchor: [40, 50],
});

const dropIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      display:flex;
      flex-direction:column;
      align-items:center;
      position:relative;
      transform:translateY(-8px);
    ">
      <div style="
        padding:5px 12px;
        border-radius:4px;
        background:white;
        color:#000000;
        font-size:10px;
        font-weight:700;
        letter-spacing:0.5px;
        text-transform:uppercase;
        box-shadow:0 6px 20px rgba(0,0,0,0.15);
        border:1px solid rgba(0,0,0,0.1);
      ">
        Drop
      </div>
      <div style="
        width:2px;
        height:12px;
        background:#000000;
      "></div>
      <div style="
        width:14px;
        height:14px;
        background:#000000;
        border:3px solid white;
        box-shadow:0 4px 12px rgba(0,0,0,0.3);
        z-index:2;
      "></div>
      <div style="
        position:absolute;
        bottom:-6px;
        width:14px;
        height:4px;
        background:rgba(0,0,0,0.2);
        border-radius:50%;
        filter:blur(3px);
      "></div>
    </div>
  `,
  iconSize: [70, 50],
  iconAnchor: [35, 50],
});

const driverIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      display:flex;
      flex-direction:column;
      align-items:center;
      position:relative;
      transform:translateY(-8px);
    ">
      <div style="
        padding:5px 12px;
        border-radius:4px;
        background:white;
        color:#000000;
        font-size:10px;
        font-weight:700;
        letter-spacing:0.5px;
        text-transform:uppercase;
        box-shadow:0 6px 20px rgba(0,0,0,0.15);
        border:1px solid rgba(0,0,0,0.1);
      ">
        Driver
      </div>
      <div style="
        width:2px;
        height:12px;
        background:#000000;
      "></div>
      <div style="
        display:flex;
        align-items:center;
        justify-content:center;
        width:28px;
        height:28px;
        background:#000000;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 6px 15px rgba(0,0,0,0.3);
        z-index:2;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 15V17C19 17.5523 18.5523 18 18 18H17C16.4477 18 16 17.5523 16 17V16H8V17C8 17.5523 7.55228 18 7 18H6C5.44772 18 4 17.5523 4 17V15L3.10557 12.3167C3.03662 12.1099 3 11.9922 3 11.874V9C3 7.89543 3.89543 7 5 7H19C20.1046 7 21 7.89543 21 9V11.874C21 11.9922 20.9634 12.1099 20.8944 12.3167L19 15Z" fill="white"/>
          <path d="M6 10H18V12H6V10Z" fill="#000000"/>
          <circle cx="7.5" cy="15.5" r="1.5" fill="white"/>
          <circle cx="16.5" cy="15.5" r="1.5" fill="white"/>
        </svg>
      </div>
      <div style="
        position:absolute;
        bottom:-12px;
        width:20px;
        height:5px;
        background:rgba(0,0,0,0.20);
        border-radius:50%;
        filter:blur(3px);
      "></div>
    </div>
  `,
  iconSize: [52, 52],
  iconAnchor: [26, 26],
});

function LiveTracking({
  driverLocation,
  pickUpLocation,
  dropLocation,
  mapStatus,
  onStats,
}: Props) {
  const [routeToPickUp, setRouteToPickup] = useState<[number, number][]>([]);
  const [routeToDrop, setRouteToDrop] = useState<[number, number][]>([]);

  useEffect(() => {
    if (!driverLocation || !pickUpLocation || !dropLocation) return;

    const [drLat, drLon] = driverLocation as [number, number];
    if (drLat === 0 || drLon === 0) return;

    const [pLat, pLon] = pickUpLocation as [number, number];
    const [dLat, dLon] = dropLocation as [number, number];

    if (!drLat || !drLon || !pLat || !pLon || !dLat || !dLon) return;
  if (drLat === 0 || drLon === 0) return;

    const getRoute = async (
      startLat: number,
      startLon: number,
      endLat: number,
      endLon: number
    ) => {
     try {
      const res = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`
      );
      return res.data.routes?.[0];
    } catch (err) {
      console.error("OSRM Routing Error:", err);
      return null;
    }
    };

    const fetchRoutes = async () => {
      try {
        if (mapStatus === "arriving") {
          const pickUpRoute = await getRoute(drLat, drLon, pLat, pLon);
          const dropRoute = await getRoute(drLat, drLon, dLat, dLon);

          if (pickUpRoute) {
            setRouteToPickup(
              pickUpRoute.geometry.coordinates.map(([lon, lat]: number[]) => [
                lat,
                lon,
              ])
            );
          }
          if (dropRoute) {
            setRouteToDrop(
              dropRoute.geometry.coordinates.map(([lon, lat]: number[]) => [
                lat,
                lon,
              ])
            );
          }
          onStats?.({
            distanceToPickUp: (pickUpRoute?.distance ?? 0) / 1000,
            etaToPickup: (pickUpRoute?.duration ?? 0) / 60,
            distanceToDrop: (dropRoute?.distance ?? 0) / 1000,
            etaToDrop: (dropRoute?.duration ?? 0) / 60,
          });
        } else {
          setRouteToPickup([]);
          const dropRoute = await getRoute(drLat, drLon, dLat, dLon);
          if (dropRoute) {
            setRouteToDrop(
              dropRoute.geometry.coordinates.map(([lon, lat]: number[]) => [
                lat,
                lon,
              ])
            );
          }
          onStats?.({
            distanceToPickUp: 0,
            etaToPickup: 0,
            distanceToDrop: (dropRoute?.distance ?? 0) / 1000,
            etaToDrop: (dropRoute?.duration ?? 0) / 60,
          });
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchRoutes();
  }, [driverLocation, mapStatus]);

  const showPickMarker = mapStatus === "arriving";
  const showPickUpRoute = mapStatus === "arriving" && routeToPickUp.length > 0;
  const showDropRoute = mapStatus !== "completed" && routeToDrop.length > 0;

  return (
    <div className="relative h-full w-full bg-zinc-100">
      <MapContainer
        center={pickUpLocation as any}
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {showPickMarker && pickUpLocation && (
          <Marker
            position={pickUpLocation as any}
            icon={pickUpIcon}
            draggable
          />
        )}

        {dropLocation && (
          <Marker position={dropLocation as any} icon={dropIcon} draggable />
        )}

        {driverLocation && (
          <Marker
            position={driverLocation as any}
            icon={driverIcon}
            draggable
          />
        )}

        {showPickUpRoute && (
          <Polyline
            positions={routeToPickUp}
            pathOptions={{
              color: "#888",
              weight: 4,
              dashArray: "2 10",
              opacity: 0.9,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}

        {showDropRoute && (
          <Polyline
            positions={routeToDrop}
            pathOptions={{
              color: "#0a0a0a",
              weight: 5,
              opacity: 0.9,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default LiveTracking;
