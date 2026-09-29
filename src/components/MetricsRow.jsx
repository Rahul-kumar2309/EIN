import React from 'react';
import { Thermometer, Wind, Waves, ShieldAlert, Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * MetricCard — A single sensor metric display card.
 */
function MetricCard({ icon: Icon, label, value, unit, subtext, color, isEmergency, barPercent, trend }) {
  const colorMap = {
    blue:   { border: 'border-blue-500/30',   text: 'text-blue-400',   bg: 'bg-blue-500/10',   bar: 'bg-blue-400',   glow: 'glow-blue' },
    cyan:   { border: 'border-cyan-500/30',   text: 'text-cyan-400',   bg: 'bg-cyan-500/10',   bar: 'bg-cyan-400',   glow: 'glow-cyan' },
    teal:   { border: 'border-teal-500/30',   text: 'text-teal-400',   bg: 'bg-teal-500/10',   bar: 'bg-teal-400',   glow: 'glow-cyan' },
    green:  { border: 'border-emerald-500/30',text: 'text-emerald-400',bg: 'bg-emerald-500/10',bar: 'bg-emerald-400',glow: 'glow-green' },
    amber:  { border: 'border-amber-500/30',  text: 'text-amber-400',  bg: 'bg-amber-500/10',  bar: 'bg-amber-400',  glow: 'glow-amber' },
    red:    { border: 'border-red-500/50',     text: 'text-red-400',    bg: 'bg-red-500/15',    bar: 'bg-red-400',    glow: 'glow-red' },
  };
  const c = colorMap[color] || colorMap.blue;
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div
      className={`glass-card ${c.glow} border ${isEmergency ? 'border-red-500/50 animate-emergency' : c.border}
        p-4 flex flex-col gap-3 relative overflow-hidden transition-all duration-500 group`}
    >
      {/* Background accent */}
      <div
        className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 ${
          isEmergency ? 'bg-red-500' : c.bg
        }`}
      />

      {/* Top row */}
      <div className="flex items-start justify-between relative z-10">
        <div className={`p-2 rounded-lg ${isEmergency ? 'bg-red-500/15 border border-red-500/30' : `${c.bg} border ${c.border}`}`}>
          <Icon
            size={18}
            className={`${isEmergency ? 'text-red-400' : c.text} ${isEmergency ? 'animate-pulse' : ''}`}
            style={isEmergency ? { filter: 'drop-shadow(0 0 6px #ef4444)' } : {}}
          />
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-mono-code ${
          trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-emerald-400' : 'text-slate-500'
        }`}>
          <TrendIcon size={11} />
          <span>{trend === 'up' ? '+' : trend === 'down' ? '-' : '—'}</span>
        </div>
      </div>

      {/* Value */}
      <div className="relative z-10">
        <div className={`font-orbitron font-bold text-2xl tracking-wider ${
          isEmergency ? 'text-red-300 text-glow-red animate-flicker' : c.text
        }`}>
          {value}
          <span className={`text-sm ml-1 font-normal ${isEmergency ? 'text-red-400/70' : 'text-slate-400'}`}>
            {unit}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5 font-medium tracking-wide">{label}</div>
        <div className={`text-[10px] mt-1 font-mono-code ${isEmergency ? 'text-red-400/70' : 'text-slate-500'}`}>
          {subtext}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${isEmergency ? 'bg-red-400' : c.bar}`}
          style={{ width: `${Math.min(barPercent, 100)}%` }}
        />
      </div>
    </div>
  );
}

/**
 * MetricsRow — 4-card top row of sensor metrics.
 */
export default function MetricsRow({ data, prevData }) {
  const isFireEmergency = data.is_fire;
  const isFloodAlert = data.is_flood;

  const tempPercent = Math.min(((data.temperature - 20) / 60) * 100, 100);
  const gasPercent = Math.min((data.gas_level / 3000) * 100, 100);
  const waterPercent = Math.min((data.water_level / 100) * 100, 100);

  const tempTrend = prevData
    ? data.temperature > prevData.temperature ? 'up' : data.temperature < prevData.temperature ? 'down' : 'flat'
    : 'flat';
  const gasTrend = prevData
    ? data.gas_level > prevData.gas_level ? 'up' : data.gas_level < prevData.gas_level ? 'down' : 'flat'
    : 'flat';
  const waterTrend = prevData
    ? data.water_level > prevData.water_level ? 'up' : data.water_level < prevData.water_level ? 'down' : 'flat'
    : 'flat';

  const systemStatus = isFireEmergency
    ? { label: 'CRITICAL — FIRE', color: 'red', sub: '🔥 Immediate action required' }
    : isFloodAlert
    ? { label: 'WARNING — FLOOD', color: 'amber', sub: '🌊 Elevated water detected' }
    : data.gas_level > 800
    ? { label: 'CAUTION — GAS', color: 'amber', sub: '⚠ Gas above threshold' }
    : { label: 'ALL SYSTEMS SAFE', color: 'green', sub: '✓ Operating normally' };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-4 pb-2">
      <MetricCard
        icon={Thermometer}
        label="Temperature"
        value={data.temperature.toFixed(1)}
        unit="°C"
        subtext={`Node: ${data.node_id}`}
        color={isFireEmergency ? 'red' : data.temperature > 45 ? 'amber' : 'blue'}
        isEmergency={isFireEmergency}
        barPercent={tempPercent}
        trend={tempTrend}
      />
      <MetricCard
        icon={Wind}
        label="Air Quality / Gas Level"
        value={data.gas_level}
        unit="PPM"
        subtext={data.gas_level > 1000 ? '⚠ Hazardous level' : 'Within safe range'}
        color={isFireEmergency ? 'red' : data.gas_level > 800 ? 'amber' : 'cyan'}
        isEmergency={isFireEmergency}
        barPercent={gasPercent}
        trend={gasTrend}
      />
      <MetricCard
        icon={Waves}
        label="Flood Risk / Water Level"
        value={data.water_level}
        unit="cm"
        subtext={isFloodAlert ? '⚠ Flood threshold exceeded' : 'Ground sensor active'}
        color={isFloodAlert ? 'amber' : 'teal'}
        isEmergency={false}
        barPercent={waterPercent}
        trend={waterTrend}
      />
      <MetricCard
        icon={isFireEmergency || isFloodAlert ? ShieldAlert : Shield}
        label="System Status"
        value={isFireEmergency ? 'DANGER' : isFloodAlert ? 'CAUTION' : 'SAFE'}
        unit=""
        subtext={systemStatus.sub}
        color={systemStatus.color}
        isEmergency={isFireEmergency}
        barPercent={isFireEmergency ? 100 : isFloodAlert ? 60 : 20}
        trend={isFireEmergency ? 'up' : 'flat'}
      />
    </div>
  );
}
