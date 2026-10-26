import { useMemo } from "react";
import { MapContainer, Marker, Polyline, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DEMO_HUB, destinationFor, pointAlongRoute, routeFor } from "../utils/tracking";

// Custom div icons (avoids Leaflet's default image-asset resolution issues
// under Vite and keeps markers on-brand).
function dotIcon(bg, glyph) {
  return L.divIcon({
    className: "fc-marker",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:9999px;background:${bg};color:#fff;font-weight:800;font-size:18px;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.25)">${glyph}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

export default function TrackingMap({ orderRef, progress }) {
  const route = useMemo(() => routeFor(orderRef), [orderRef]);
  const dest = useMemo(() => destinationFor(orderRef), [orderRef]);
  const rider = useMemo(() => pointAlongRoute(route, progress), [route, progress]);
  const center = useMemo(
    () => [(DEMO_HUB.lat + dest.lat) / 2, (DEMO_HUB.lng + dest.lng) / 2],
    [dest]
  );
  const icons = useMemo(
    () => ({
      hub: dotIcon("#14532D", "F"),
      dest: dotIcon("#f97316", "⌂"),
      rider: dotIcon("#16A34A", "➤"),
    }),
    []
  );

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      attributionControl
      style={{ height: "100%", width: "100%", minHeight: 320, zIndex: 0 }}
      aria-label="Demo delivery map"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* Illustrative demo route line — not a road/driving route. */}
      <Polyline positions={route.map((p) => [p.lat, p.lng])} pathOptions={{ color: "#16A34A", weight: 4, dashArray: "10 8" }} />
      <Marker position={[DEMO_HUB.lat, DEMO_HUB.lng]} icon={icons.hub} title={DEMO_HUB.label} />
      <Marker position={[dest.lat, dest.lng]} icon={icons.dest} title={dest.label} />
      <Marker position={[rider.lat, rider.lng]} icon={icons.rider} title="Demo rider (simulated)" />
    </MapContainer>
  );
}
