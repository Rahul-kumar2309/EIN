import React from 'react';
import { Activity, Wifi, WifiOff, Zap } from 'lucide-react';

/**
 * Header — "EIN — Environmental Intelligence Network"
 * Shows live edge-sync status and emergency pulsing border when isEmergency = true.
 */
export default function Header({ isEmergency, liveSyncActive }) {
  return (
    <header
      className={`relative flex items-center justify-between px-6 py-3 border-b transition-all duration-500 ${
        isEmergency
          ? 'animate-header-red border-red-500'
          : 'border-[#1e2d4a]'
      }`}
      style={{
        background: isEmergency
          ? 'linear-gradient(135deg, rgba(10,5,5,0.97) 0%, rgba(20,5,5,0.97) 100%)'
          : 'linear-gradient(135deg, rgba(3,7,18,0.97) 0%, rgba(10,15,30,0.97) 100%)',
      }}
    >
      {/* Scan line overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute left-0 right-0 h-px animate-scan"
          style={{ background: isEmergency ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.08)' }}
        />
      </div>

      {/* Left — Branding */}
      <div className="flex items-center gap-4 z-10">
        {/* EIN Logo Icon */}
        <div className={`relative flex items-center justify-center w-10 h-10 rounded-lg border ${
          isEmergency ? 'border-red-500/50' : 'border-blue-500/30'
        }`}
          style={{
            background: isEmergency
              ? 'linear-gradient(135deg, #1a0505, #2d0808)'
              : 'linear-gradient(135deg, #030c1a, #071428)',
          }}
        >
          <Zap
            size={20}
            className={`${isEmergency ? 'text-red-400 animate-pulse' : 'text-blue-400'} animate-float`}
            style={{ filter: isEmergency ? 'drop-shadow(0 0 6px #ef4444)' : 'drop-shadow(0 0 6px #60a5fa)' }}
          />
        </div>

        <div>
          <h1
            className={`font-orbitron font-bold tracking-widest text-sm md:text-base ${
              isEmergency ? 'text-red-400 text-glow-red' : 'text-cyan-300 text-glow-cyan'
            }`}
          >
            EIN
          </h1>
          <p className="font-orbitron text-[9px] tracking-[0.3em] text-slate-500 uppercase">
            Environmental Intelligence Network
          </p>
        </div>

        {/* System ID Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5">
          <Activity size={11} className="text-blue-400" />
          <span className="font-mono-code text-[10px] text-blue-400/80 tracking-wider">SYS_ID: EIN-CTRL-v2.4.1</span>
        </div>
      </div>

      {/* Right — Status indicators */}
      <div className="flex items-center gap-4 z-10">
        {/* Emergency Banner */}
        {isEmergency && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/40 animate-emergency">
            <div className="relative w-2 h-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="absolute inset-0 rounded-full bg-red-500 animate-pulse-red" />
            </div>
            <span className="font-orbitron text-[10px] font-bold tracking-widest text-red-400 uppercase">
              ⚠ EMERGENCY ACTIVE
            </span>
          </div>
        )}

        {/* Live Edge-Sync */}
        <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border ${
          liveSyncActive
            ? 'border-emerald-500/30 bg-emerald-500/8'
            : 'border-slate-600/30 bg-slate-800/30'
        }`}>
          <div className="relative w-2.5 h-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${liveSyncActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            {liveSyncActive && (
              <div className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-green" />
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {liveSyncActive
              ? <Wifi size={11} className="text-emerald-400" />
              : <WifiOff size={11} className="text-slate-500" />
            }
            <span className={`font-mono-code text-[10px] tracking-wider font-medium ${
              liveSyncActive ? 'text-emerald-400' : 'text-slate-500'
            }`}>
              Live Edge-Sync: {liveSyncActive ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* UTC Time */}
        <div className="hidden md:block font-mono-code text-[10px] text-slate-500 tracking-wider">
          <LiveClock />
        </div>
      </div>
    </header>
  );
}

function LiveClock() {
  const [time, setTime] = React.useState(new Date());
  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span>
      {time.toUTCString().slice(17, 25)}{' '}
      <span className="text-blue-500/60">UTC</span>
    </span>
  );
}
