"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { AnimatePresence, motion } from "motion/react";
import { MapPin, Navigation2 } from "lucide-react";

type props = {
  pickUp: string;
  drop: string;
  onChange: (p: string, d: string) => void;
  onDistance: (d: number) => void;
};

function FitBounds({ p1, p2 }: { p1: [number, number]; p2: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();

    map.fitBounds([p1, p2], {
      padding: [72, 72],
      maxZoom: 15,
      animate: true,
      duration: 1,
    });
  }, [p1, p2, map]);

  return null;
}

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
        padding:6px 14px;
        border-radius:999px;
        background:#18181b;
        color:white;
        font-size:11px;
        font-weight:800;
        letter-spacing:1px;
        text-transform:uppercase;
        box-shadow:0 10px 25px rgba(0,0,0,0.25);
        border:1px solid rgba(255,255,255,0.08);
      ">
        Pickup
      </div>

      <div style="
        width:2px;
        height:14px;
        background:#18181b;
      "></div>

      <div style="
        position:relative;
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        
        <div style="
          position:absolute;
          width:42px;
          height:42px;
          border-radius:999px;
          background:rgba(24,24,27,0.12);
          animation:pickupPulse 2s infinite;
        "></div>

        <div style="
          width:24px;
          height:24px;
          border-radius:999px;
          background:linear-gradient(135deg,#18181b,#3f3f46);
          border:4px solid white;
          box-shadow:0 10px 30px rgba(0,0,0,0.3);
          position:relative;
          z-index:2;
        "></div>
      </div>

      <div style="
        position:absolute;
        bottom:-8px;
        width:18px;
        height:6px;
        background:rgba(0,0,0,0.18);
        border-radius:999px;
        filter:blur(4px);
      "></div>
    </div>

    <style>
      @keyframes pickupPulse {
        0% {
          transform:scale(0.7);
          opacity:0.7;
        }
        70% {
          transform:scale(1.5);
          opacity:0;
        }
        100% {
          opacity:0;
        }
      }
    </style>
  `,
  iconSize: [90, 78],
  iconAnchor: [45, 66],
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
        padding:6px 14px;
        border-radius:999px;
        background:white;
        color:#18181b;
        font-size:11px;
        font-weight:800;
        letter-spacing:1px;
        text-transform:uppercase;
        box-shadow:0 10px 25px rgba(0,0,0,0.18);
        border:1px solid rgba(0,0,0,0.08);
      ">
        Drop
      </div>

      <div style="
        width:2px;
        height:14px;
        background:#ef4444;
      "></div>

      <div style="
        width:24px;
        height:24px;
        background:linear-gradient(135deg,#ef4444,#b91c1c);
        border:4px solid white;
        border-radius:999px 999px 999px 0;
        transform:rotate(-45deg);
        box-shadow:0 10px 30px rgba(239,68,68,0.4);
      "></div>

      <div style="
        position:absolute;
        bottom:-10px;
        width:18px;
        height:6px;
        background:rgba(239,68,68,0.2);
        border-radius:999px;
        filter:blur(4px);
      "></div>
    </div>
  `,
  iconSize: [90, 78],
  iconAnchor: [45, 66],
});

function SearchMap({ pickUp, drop, onChange, onDistance }: props) {
  const [p1, setP1] = useState<[number, number]>();
  const [p2, setP2] = useState<[number, number]>();
  const [route, setRoute] = useState<[number, number][]>([]);
  const [km, setKm] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const geoCoding = async (q: string): Promise<[number, number] | null> => {
    try {
      const { data } = await axios.get(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=1`
      );

      if (!data.features.length) return null;

      const [lon, lat] = data.features[0].geometry.coordinates;

      return [lat, lon];
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const reverseGeoCoding = async (lat: number, lon: number) => {
    const { data } = await axios.get(
      `https://photon.komoot.io/reverse?lon=${lon}&lat=${lat}`
    );

    if (!data.features.length) return;
    const p = data.features[0].properties;
    console.log(p);
    return [p.name, p.street, p.city, p.state, p.country, p.postcode]
      .filter(Boolean)
      .join(",");
  };

  const loadRoute = async (p: [number, number], d: [number, number]) => {
    try {
      const { data } = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${p[1]},${p[0]};${d[1]},${d[0]}?overview=full&geometries=geojson`
      );

      if (!data.routes?.length) return;

      const formattedRoute = data.routes[0].geometry.coordinates.map(
        ([lon, lat]: number[]) => [lat, lon]
      );

      setRoute(formattedRoute);

      const distKm = +(data.routes[0].distance / 1000).toFixed(2);

      setKm(distKm);
      onDistance(distKm);
    } catch (error) {
      console.log(error);
    }
  };

  const dragPickUp = async (lat: number, lon: number) => {
    const address = await reverseGeoCoding(lat, lon);
    setP1([lat, lon]);
    if (p2) {
      loadRoute([lat, lon], p2);
    }
    onChange?.(address!, drop);
  };
  const dragDrop = async (lat: number, lon: number) => {
    const address = await reverseGeoCoding(lat, lon);
    setP2([lat, lon]);
    if (p1) {
      loadRoute([lat, lon], p1);
    }
    onChange?.(pickUp, address!);
  };

  useEffect(() => {
    setLoading(false);
    if (pickUp && drop) {
      (async () => {
        const a = await geoCoding(pickUp);
        const b = await geoCoding(drop);

        if (!a || !b) return;

        setP1(a);
        setP2(b);

        await loadRoute(a, b);
        setLoading(true);
      })();
    }
  }, [pickUp, drop]);

  return (
    <div className="relative h-full w-full bg-zinc-100">
      <MapContainer
        center={p1 ?? [26.8467, 80.9462]}
        zoom={13}
        scrollWheelZoom={true}
        style={{
          width: "100%",
          height: "100%",
        }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {p1 && p2 && <FitBounds p1={p1} p2={p2} />}

        {p1 && (
          <Marker
            position={p1}
            icon={pickUpIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const m = e.target.getLatLng();
                dragPickUp(m.lat, m.lng);
              },
            }}
          />
        )}

        {p2 && (
          <Marker
            position={p2}
            icon={dropIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const m = e.target.getLatLng();
                dragDrop(m.lat, m.lng);
              },
            }}
          />
        )}

        {route.length > 0 && (
          <Polyline
            positions={route}
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

      <AnimatePresence>
        {!loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0 z-999 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center gap-4"
          >
            <div className="relative w-14 h-14 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-zinc-900"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full border border-transparent border-t-zinc-300"
              />
              <MapPin size={15} className="text-zinc-800" />
            </div>
            <div className="text-center">
              <p className="text-zinc-900 text-xs font-black tracking-[0.22em] uppercase">
                Loading Map...
              </p>
              <p className="text-zinc-400 text-[10px] font-medium tracking-wider mt-0.5">
                Plotting Your Route..
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {loading && km !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-20 left-4 z-500 flex items-center gap-2 bg-white border border-zinc-200 px-3.5 py-2 rounded-xl shadow-lg"
          >
            <Navigation2 size={13} className="text-zinc-900" />
            <span className="text-zinc-900 text-xs font-bold">{km}km</span>
            <span className="w-px h-3 bg-zinc-200" />
            <span>~{Math.max(3, Math.round((km / 25) * 60))}min</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SearchMap;
