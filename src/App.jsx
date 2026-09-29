import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import MetricsRow from './components/MetricsRow';
import GISMap from './components/GISMap';
import AlertLog from './components/AlertLog';

/* ─────────────────────────────────────────────────────────────────
   Initial sensor state — matches the exact JSON spec requested
───────────────────────────────────────────────────────────────── */
const INITIAL_SENSOR = {
  node_id: 'EIN_NODE_01',
  lat: 28.6139,
  lng: 77.2090,
  temperature: 32.5,
  gas_level: 400,
  water_level: 15,
  is_fire: false,
  is_flood: false,
};

/* Emergency override payload — triggered by stealth button */
const EMERGENCY_PAYLOAD = {
  ...INITIAL_SENSOR,
  temperature: 55.0,
  gas_level: 2500,
  water_level: 15,
  is_fire: true,
  is_flood: false,
};

/* Reset payload — revert to safe state */
const SAFE_PAYLOAD = { ...INITIAL_SENSOR };

/* ─────────────────────────────────────────────────────────────────
   Mock API: simulates `/api/sensors` with random variance
───────────────────────────────────────────────────────────────── */
function mockFetchSensors(baseData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (baseData.is_fire) {
        // During fire emergency — values escalate slightly each tick
        resolve({
          ...baseData,
          temperature: parseFloat((baseData.temperature + (Math.random() * 0.8 - 0.2)).toFixed(1)),
          gas_level: Math.round(baseData.gas_level + (Math.random() * 20 - 5)),
        });
      } else {
        // Normal — gentle drift
        resolve({
          ...baseData,
          temperature: parseFloat((baseData.temperature + (Math.random() * 1.2 - 0.6)).toFixed(1)),
          gas_level: Math.round(baseData.gas_level + (Math.random() * 30 - 15)),
          water_level: parseFloat((baseData.water_level + (Math.random() * 0.4 - 0.2)).toFixed(1)),
        });
      }
    }, 200);
  });
}

/* ─────────────────────────────────────────────────────────────────
   Alert log helpers
───────────────────────────────────────────────────────────────── */
let alertIdCounter = 0;

function makeAlert(type, message, nodeId = 'EIN_NODE_01') {
  const now = new Date();
  const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  return { id: ++alertIdCounter, type, message, timestamp: time, nodeId };
}

function buildInitialAlerts() {
  return [
    makeAlert('SAFE',    '✅ System initialised — All nodes nominal', 'SYSTEM'),
    makeAlert('INFO',    '📡 Edge sync established — 5 nodes online', 'GATEWAY'),
    makeAlert('INFO',    '🌡 Baseline temp: 32.5°C — Normal', 'EIN_NODE_01'),
    makeAlert('SAFE',    '💨 Air quality: 400 PPM — Safe range', 'EIN_NODE_01'),
    makeAlert('SAFE',    '💧 Water level: 15 cm — No flood risk', 'EIN_NODE_05'),
  ];
}

/* ─────────────────────────────────────────────────────────────────
   Bottom-right stealth button — click count-based demo trigger
   3 rapid clicks → Emergency | 3 more → Reset to Safe
───────────────────────────────────────────────────────────────── */
function StealthButton({ onEmergency, onReset, isEmergency }) {
  const clickRef = useRef(0);
  const timerRef = useRef(null);

  const handleClick = () => {
    clickRef.current += 1;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { clickRef.current = 0; }, 1200);

    if (clickRef.current >= 3) {
      clickRef.current = 0;
      clearTimeout(timerRef.current);
      if (isEmergency) onReset();
      else onEmergency();
    }
  };

  return (
    <button
      onClick={handleClick}
      title=""
      aria-label="System diagnostic"
      className="stealth-btn fixed bottom-4 right-4 z-[9999] w-8 h-8 rounded-full
        border border-slate-700 bg-slate-900 flex items-center justify-center
        focus:outline-none select-none"
      style={{ cursor: 'default' }}
    >
      <span className="font-mono-code text-[8px] text-slate-600">⬡</span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SIDEBAR PANEL — Node detail + system diagnostics
───────────────────────────────────────────────────────────────── */
function NodeDetailPanel({ data }) {
  const fields = [
    { key: 'Node ID',     val: data.node_id,          mono: true },
    { key: 'Latitude',    val: data.lat.toFixed(4) + '° N' },
    { key: 'Longitude',   val: data.lng.toFixed(4) + '° E' },
    { key: 'Temperature', val: `${data.temperature.toFixed(1)} °C`, alert: data.temperature > 45 },
    { key: 'Gas (PPM)',   val: data.gas_level,         alert: data.gas_level > 800 },
    { key: 'Water (cm)',  val: data.water_level.toFixed(1), alert: data.is_flood },
    { key: 'Fire',        val: data.is_fire ? '🔥 YES' : 'NO', alert: data.is_fire },
    { key: 'Flood',       val: data.is_flood ? '🌊 YES' : 'NO', alert: data.is_flood },
  ];

  return (
    <div className="glass-card border border-[#1e2d4a] p-3 flex flex-col gap-2">
      <div className="font-orbitron text-[10px] tracking-widest text-slate-400 uppercase border-b border-[#1e2d4a] pb-2">
        Node Telemetry
      </div>
      <div className="space-y-1.5">
        {fields.map(f => (
          <div key={f.key} className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500">{f.key}</span>
            <span className={`font-mono-code text-[11px] ${
              f.alert ? 'text-red-400 animate-flicker' : f.mono ? 'text-blue-400' : 'text-slate-300'
            }`}>
              {String(f.val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────────────────────────── */
export default function App() {
  const [sensorData, setSensorData]   = useState(INITIAL_SENSOR);
  const [prevData,   setPrevData]     = useState(null);
  const [alerts,     setAlerts]       = useState(buildInitialAlerts);
  const [isEmergency, setIsEmergency] = useState(false);
  const [liveSyncActive, setLiveSyncActive] = useState(true);
  const sensorRef = useRef(sensorData);

  // Keep ref in sync so interval closure always has latest data
  useEffect(() => { sensorRef.current = sensorData; }, [sensorData]);

  /* ── Real-time polling (3s interval, mocks /api/sensors) ── */
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const fresh = await mockFetchSensors(sensorRef.current);
        setPrevData(sensorRef.current);
        setSensorData(fresh);
        setLiveSyncActive(true);

        // Log only meaningful changes
        if (!fresh.is_fire && !fresh.is_flood) {
          if (fresh.gas_level > 800 && sensorRef.current.gas_level <= 800) {
            pushAlert('GAS', `⚠ Gas level elevated: ${fresh.gas_level} PPM`);
          } else if (fresh.temperature > 42 && sensorRef.current.temperature <= 42) {
            pushAlert('WARNING', `🌡 Temp spike: ${fresh.temperature}°C detected`);
          }
        }
      } catch {
        setLiveSyncActive(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []); // empty deps — interval reads from ref

  const pushAlert = useCallback((type, message, nodeId) => {
    setAlerts(prev => [makeAlert(type, message, nodeId), ...prev].slice(0, 50));
  }, []);

  /* ── Stealth: trigger emergency ── */
  const triggerEmergency = useCallback(() => {
    setSensorData(EMERGENCY_PAYLOAD);
    setPrevData(sensorRef.current);
    setIsEmergency(true);

    setAlerts(prev => [
      makeAlert('FIRE', '🔥 CRITICAL: FIRE DETECTED AT NODE 1!', 'EIN_NODE_01'),
      makeAlert('FIRE', '🚨 Gas level CRITICAL: 2500 PPM — Evacuate!', 'EIN_NODE_01'),
      makeAlert('WARNING', '🌡 Temperature surge: 55.0°C at Node 1', 'EIN_NODE_01'),
      makeAlert('WARNING', '📡 Thermal breach — activating fire protocol', 'SYSTEM'),
      ...prev,
    ].slice(0, 50));
  }, []);

  /* ── Stealth: reset to safe state ── */
  const triggerReset = useCallback(() => {
    setSensorData(SAFE_PAYLOAD);
    setPrevData(EMERGENCY_PAYLOAD);
    setIsEmergency(false);

    setAlerts(prev => [
      makeAlert('SAFE', '✅ Emergency cleared — Returning to nominal', 'SYSTEM'),
      makeAlert('SAFE', '🌡 Temperature normalised: 32.5°C', 'EIN_NODE_01'),
      makeAlert('SAFE', '💨 Gas level: 400 PPM — Safe', 'EIN_NODE_01'),
      ...prev,
    ].slice(0, 50));
  }, []);

  return (
    <div className={`ein-grid-bg h-screen w-screen flex flex-col overflow-hidden transition-all duration-700 ${
      isEmergency ? 'bg-red-950/20' : ''
    }`}>

      {/* ── HEADER ── */}
      <Header isEmergency={isEmergency} liveSyncActive={liveSyncActive} />

      {/* ── METRICS ROW ── */}
      <div className="py-3 flex-shrink-0">
        <MetricsRow data={sensorData} prevData={prevData} />
      </div>

      {/* ── MAIN SPLIT VIEW ── */}
      <div className="flex-1 flex gap-3 px-4 pb-4 min-h-0">

        {/* Left side: GIS Map (70%) */}
        <div className="flex flex-col gap-3" style={{ flex: '0 0 70%' }}>
          {/* Map area */}
          <div className="flex-1 min-h-0">
            <GISMap data={sensorData} />
          </div>

          {/* Bottom stats bar */}
          <div className="glass-card border border-[#1e2d4a] px-4 py-2 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-6">
              {[
                { label: 'NODES ACTIVE', value: '5/5',       color: 'text-emerald-400' },
                { label: 'DATA PACKETS', value: '1,204',     color: 'text-blue-400'    },
                { label: 'COVERAGE',     value: '12.4 km²',  color: 'text-cyan-400'    },
                { label: 'UPTIME',       value: '99.8%',     color: 'text-slate-300'   },
              ].map(s => (
                <div key={s.label} className="flex flex-col">
                  <span className={`font-orbitron text-xs font-bold ${s.color}`}>{s.value}</span>
                  <span className="font-mono-code text-[9px] text-slate-600 tracking-widest">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono-code text-[10px] text-slate-500">LIVE FEED ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Right side: Alert Log (30%) */}
        <div className="flex flex-col gap-3 flex-1 min-h-0 min-w-0">
          {/* Alert log */}
          <div className="flex-1 min-h-0">
            <AlertLog alerts={alerts} />
          </div>

          {/* Node detail telemetry card */}
          <div className="flex-shrink-0">
            <NodeDetailPanel data={sensorData} />
          </div>
        </div>
      </div>

      {/* ── STEALTH BUTTON (bottom-right corner) ── */}
      <StealthButton
        onEmergency={triggerEmergency}
        onReset={triggerReset}
        isEmergency={isEmergency}
      />
    </div>
  );
}
