import React, { useRef, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, Flame, Droplets, Wind, Radio } from 'lucide-react';

/**
 * Returns the correct icon + styling for each alert event type.
 */
function getAlertStyle(type) {
  switch (type) {
    case 'FIRE':
      return { icon: Flame,         color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/30',   dot: 'bg-red-500'     };
    case 'FLOOD':
      return { icon: Droplets,       color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/30',   dot: 'bg-sky-500'     };
    case 'GAS':
      return { icon: Wind,           color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30', dot: 'bg-amber-500'   };
    case 'WARNING':
      return { icon: AlertTriangle,  color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/25',dot: 'bg-yellow-400'  };
    case 'SAFE':
      return { icon: CheckCircle,    color: 'text-emerald-400', bg: 'bg-emerald-500/8',  border: 'border-emerald-500/25',dot: 'bg-emerald-500' };
    default:
      return { icon: Radio,          color: 'text-blue-400',    bg: 'bg-blue-500/8',     border: 'border-blue-500/20',  dot: 'bg-blue-500'    };
  }
}

/**
 * AlertItem — a single alert row.
 */
function AlertItem({ alert, isNew }) {
  const style = getAlertStyle(alert.type);
  const IconComp = style.icon;

  return (
    <div
      className={`flex gap-3 p-3 rounded-lg border ${style.bg} ${style.border} ${
        isNew ? 'animate-slide-in' : ''
      } ${alert.type === 'FIRE' ? 'animate-emergency' : ''} transition-all`}
    >
      {/* Left — icon + dot */}
      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
        <div className={`p-1.5 rounded-md ${style.bg} border ${style.border}`}>
          <IconComp size={13} className={`${style.color} ${alert.type === 'FIRE' ? 'animate-pulse' : ''}`} />
        </div>
        <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      </div>

      {/* Right — content */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium leading-snug ${style.color}`}>
          {alert.message}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-mono-code text-[9px] text-slate-500">{alert.timestamp}</span>
          {alert.nodeId && (
            <span className="font-mono-code text-[9px] text-blue-500/70 bg-blue-500/8 px-1.5 py-0.5 rounded">
              {alert.nodeId}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * AlertLog — scrollable right-panel real-time alerts list.
 */
export default function AlertLog({ alerts }) {
  const scrollRef = useRef(null);

  // Auto-scroll to top when new alert arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [alerts.length]);

  const criticalCount = alerts.filter(a => a.type === 'FIRE' || a.type === 'FLOOD').length;

  return (
    <div className="glass-card h-full flex flex-col overflow-hidden border border-[#1e2d4a]">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2d4a] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-blue-400" />
          <h2 className="font-orbitron text-[11px] font-semibold tracking-widest text-slate-300 uppercase">
            Alert Log
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 font-mono-code text-[9px] text-red-400 animate-pulse">
              {criticalCount} CRITICAL
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 font-mono-code text-[9px] text-blue-400">
            {alerts.length} EVENTS
          </span>
        </div>
      </div>

      {/* Scrollable list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0"
      >
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
            <Radio size={28} className="animate-pulse" />
            <span className="font-mono-code text-xs">Awaiting sensor data...</span>
          </div>
        ) : (
          alerts.map((alert, i) => (
            <AlertItem key={alert.id} alert={alert} isNew={i === 0} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#1e2d4a] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono-code text-[9px] text-slate-500 tracking-wider">
            EDGE RELAY · SYNC INTERVAL 3s · NODE EIN_01
          </span>
        </div>
      </div>
    </div>
  );
}
