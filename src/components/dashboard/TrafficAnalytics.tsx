'use client';

import { Globe, Link as LinkIcon } from 'lucide-react';
import { Analytics } from '@/src/types';
import { useState } from 'react';

interface TrafficAnalyticsProps {
  sourceSummary: Analytics['sourceSummary'];
  countrySummary: Analytics['countrySummary'];
}

const GEO_COLORS = ['#16a34a','#22c55e','#4ade80','#86efac','#059669','#34d399','#6ee7b7','#a7f3d0'];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function DonutChart({ data }: { data: Analytics['countrySummary'] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = data.reduce((s, d) => s + d.views, 0);
  if (data.length === 0) return <p className="py-4 text-sm text-zinc-500">No country data yet.</p>;

  const cx = 110, cy = 110, outerR = 90, innerR = 62, gap = 2;
  let cursor = 0;
  const segments = data.map((item, i) => {
    const sweep = total > 0 ? (item.views / total) * (360 - data.length * gap) : 0;
    const start = cursor;
    const end = cursor + sweep;
    cursor = end + gap;
    return { item, start, end, color: GEO_COLORS[i % GEO_COLORS.length] };
  });

  const active = segments[activeIndex];
  const activePercent = total > 0 ? Math.round((active.item.views / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-zinc-100">
      <div className="flex justify-center items-center pb-4 sm:pb-0 sm:pr-6">
        <svg width={220} height={220} viewBox="0 0 220 220" className="shrink-0">
          {segments.map((seg, i) => {
            const isActive = i === activeIndex;
            const r = isActive ? outerR + 5 : outerR;
            const iR = isActive ? innerR - 3 : innerR;
            const largeArc = seg.end - seg.start > 180 ? 1 : 0;
            const s1 = polarToCartesian(cx, cy, r, seg.end);
            const e1 = polarToCartesian(cx, cy, r, seg.start);
            const s2 = polarToCartesian(cx, cy, iR, seg.end);
            const e2 = polarToCartesian(cx, cy, iR, seg.start);
            const d = `M ${s1.x} ${s1.y} A ${r} ${r} 0 ${largeArc} 0 ${e1.x} ${e1.y} L ${e2.x} ${e2.y} A ${iR} ${iR} 0 ${largeArc} 1 ${s2.x} ${s2.y} Z`;
            return (
              <path key={i} d={d} fill={seg.color} opacity={isActive ? 1 : 0.6}
                style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={() => setActiveIndex(i)} />
            );
          })}
          <text x={cx} y={cy - 12} textAnchor="middle" fill="#18181b" style={{ fontSize: 11, fontWeight: 700 }}>{active.item.country}</text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="#18181b" style={{ fontSize: 26, fontWeight: 900 }}>{activePercent}%</text>
          <text x={cx} y={cy + 27} textAnchor="middle" fill="#71717a" style={{ fontSize: 10 }}>{active.item.views}v · {active.item.clicks}c</text>
        </svg>
      </div>
      <div className="min-w-0 max-h-56 overflow-y-auto sm:pl-6">
        {data.map((item, i) => (
          <div key={item.country} onMouseEnter={() => setActiveIndex(i)}
            className={`flex cursor-pointer items-center gap-2.5 border-b border-zinc-100 py-2.5 last:border-0 transition-colors ${activeIndex === i ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: GEO_COLORS[i % GEO_COLORS.length] }} />
            <span className="flex-1 truncate text-sm font-medium text-zinc-900">{item.country}</span>
            <span className="hidden text-xs text-zinc-400 sm:inline">{item.views} views</span>
            <span className="w-9 text-right text-xs font-semibold tabular-nums text-zinc-700">
              {total > 0 ? Math.round((item.views / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrafficAnalytics({ sourceSummary, countrySummary }: TrafficAnalyticsProps) {
  return (
    <div className="flex flex-col gap-5">

      {/* Traffic Sources */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/60 px-4 py-3">
          <LinkIcon className="h-4 w-4 text-zinc-400" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Traffic sources</h3>
        </div>
        <div>
          {sourceSummary.length > 0 && (
            <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-2">
              <span className="w-5 shrink-0" />
              <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Source</span>
              <span className="w-16 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Clicks</span>
              <span className="w-16 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Views</span>
              <span className="w-14 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400">CTR</span>
            </div>
          )}
          {sourceSummary.length > 0 ? sourceSummary.map((source, i) => {
            const ctr = source.views > 0 ? ((source.clicks / source.views) * 100).toFixed(0) : '0';
            return (
              <div key={source.source} className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3 last:border-0 hover:bg-zinc-50 transition-colors">
                <span className="w-5 shrink-0 text-xs tabular-nums text-zinc-400">{i + 1}.</span>
                <span className="flex-1 truncate text-sm font-medium capitalize text-zinc-900">{source.source}</span>
                <span className="w-16 text-right text-sm tabular-nums text-zinc-600">{source.clicks}</span>
                <span className="w-16 text-right text-sm tabular-nums text-zinc-600">{source.views}</span>
                <span className="w-14 text-right text-sm font-semibold tabular-nums text-zinc-900">{ctr}%</span>
              </div>
            );
          }) : (
            <p className="px-4 py-8 text-sm text-zinc-400">No source data yet.</p>
          )}
        </div>
      </div>

      {/* Geography */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/60 px-4 py-3">
          <Globe className="h-4 w-4 text-zinc-400" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Audience geography</h3>
        </div>
        <div className="p-4">
          <DonutChart data={countrySummary} />
        </div>
      </div>

    </div>
  );
}
