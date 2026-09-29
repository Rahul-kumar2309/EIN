import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

/* ─────────────────────────────────────────────────────────────────
   Custom DivIcon factories — replaces default leaflet marker
   with a cinematic pulsing dot (green = safe, red = fire)
───────────────────────────────────────────────────────────────── */
function createNodeIcon(isFire, isActive = true) {
  const color = isFire ? '#ef4444' : '#10b981';
  const glow  = isFire ? 'rgba(239,68,68,0.6)' : 'rgba(16,185,129,0.5)';
  const anim  = isFire ? 'pulse-ring-red 0.8s ease-out infinite' : 'pulse-ring-green 1.8s ease-out infinite';

  const html = `
    <div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center;">
      <!-- Outer pulse ring -->
      <div style="
        position:absolute;width:28px;height:28px;border-radius:50%;
        background:${color};opacity:0.4;
        animation:${anim};
      "></div>
      <!-- Mid ring -->
      <div style="
        position:absolute;width:20px;height:20px;border-radius:50%;
        background:${color};opacity:0.25;
        animation:${anim};animation-delay:0.3s;
      "></div>
      <!-- Core dot -->
      <div style="
        width:12px;height:12px;border-radius:50%;
        background:${color};
        box-shadow:0 0 16px ${glow},0 0 6px ${color};
        border:2px solid rgba(255,255,255,0.3);
        position:relative;z-index:2;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

/* Keep map view on the sensor node */
function MapFlyTo({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), { duration: 1.5 });
  }, [lat, lng, map]);
  return null;
}

/* ─────────────────────────────────────────────────────────────────
   Additional static decorative sensor nodes for realism
───────────────────────────────────────────────────────────────── */
const STATIC_NODES = [
  { id: 'EIN_NODE_02', lat: 28.6280, lng: 77.2300, label: 'Forest Sector B' },
  { id: 'EIN_NODE_03', lat: 28.6050, lng: 77.1950, label: 'Riverbank Alpha' },
  { id: 'EIN_NODE_04', lat: 28.6200, lng: 77.1750, label: 'Hill Station Δ' },
  { id: 'EIN_NODE_05', lat: 28.5980, lng: 77.2250, label: 'Flood Plain Γ' },
];

/**
 * GISMap — React-Leaflet map with dark tile layer, animated markers,
 * fire radius circle, and popup details.
 */
export default function GISMap({ data }) {
  const isFire = data.is_fire;
  const isFlood = data.is_flood;
  const mainIcon = createNodeIcon(isFire);
  const safeIcon = createNodeIcon(false);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-[#1e2d4a]"
      style={{ minHeight: 300 }}>
      {/* Map label overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1.5 pointer-events-none">
        <div className="px-2.5 py-1 rounded-md bg-[#0a0f1e]/90 border border-blue-500/20 backdrop-blur-sm">
          <span className="font-mono-code text-[10px] text-blue-400/80 tracking-widest">
            GIS · SENSOR ARRAY · INDIA GRID
          </span>
        </div>
        <div className="flex items-center gap-3 px-2.5 py-1 rounded-md bg-[#0a0f1e]/90 border border-[#1e2d4a] backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono-code text-[9px] text-slate-400">SAFE NODE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="font-mono-code text-[9px] text-slate-400">FIRE ALERT</span>
          </div>
        </div>
      </div>

      {/* Node count badge */}
      <div className="absolute top-3 right-3 z-[1000] px-2.5 py-1 rounded-md bg-[#0a0f1e]/90 border border-blue-500/20 backdrop-blur-sm pointer-events-none">
        <span className="font-mono-code text-[10px] text-cyan-400/80">
          NODES ONLINE: {STATIC_NODES.length + 1}
        </span>
      </div>

      <MapContainer
        center={[data.lat, data.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFlyTo lat={data.lat} lng={data.lng} />

        {/* ── Main active sensor node ── */}
        <Marker position={[data.lat, data.lng]} icon={mainIcon}>
          <Popup>
            <div className="font-mono-code text-xs space-y-1" style={{ minWidth: 180 }}>
              <div className="font-bold text-sm mb-2" style={{ color: isFire ? '#f87171' : '#34d399' }}>
                {isFire ? '🔥 FIRE DETECTED' : '✓ NODE NOMINAL'}
              </div>
              <div><span className="text-slate-400">ID:</span> <span className="text-blue-300">{data.node_id}</span></div>
              <div><span className="text-slate-400">Lat:</span> <span className="text-slate-200">{data.lat.toFixed(4)}</span></div>
              <div><span className="text-slate-400">Lng:</span> <span className="text-slate-200">{data.lng.toFixed(4)}</span></div>
              <div className="border-t border-slate-700 pt-1 mt-1">
                <div><span className="text-slate-400">Temp:</span> <span style={{ color: isFire ? '#f87171' : '#34d399' }}>{data.temperature}°C</span></div>
                <div><span className="text-slate-400">Gas:</span> <span style={{ color: data.gas_level > 800 ? '#fbbf24' : '#34d399' }}>{data.gas_level} PPM</span></div>
                <div><span className="text-slate-400">Water:</span> <span className="text-slate-200">{data.water_level} cm</span></div>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Fire radius circle (shown when fire = true) */}
        {isFire && (
          <Circle
            center={[data.lat, data.lng]}
            radius={600}
            pathOptions={{
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '6,6',
            }}
          />
        )}

        {/* Flood radius circle */}
        {isFlood && (
          <Circle
            center={[data.lat, data.lng]}
            radius={400}
            pathOptions={{
              color: '#38bdf8',
              fillColor: '#38bdf8',
              fillOpacity: 0.1,
              weight: 1.5,
              dashArray: '4,4',
            }}
          />
        )}

        {/* Static decorative nodes */}
        {STATIC_NODES.map((node) => (
          <Marker key={node.id} position={[node.lat, node.lng]} icon={safeIcon}>
            <Popup>
              <div className="font-mono-code text-xs space-y-1">
                <div className="font-bold text-sm text-emerald-400 mb-1">✓ NODE NOMINAL</div>
                <div><span className="text-slate-400">ID:</span> <span className="text-blue-300">{node.id}</span></div>
                <div className="text-slate-300">{node.label}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
