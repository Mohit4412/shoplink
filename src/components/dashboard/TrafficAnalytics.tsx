'use client';

import { Globe, Link as LinkIcon } from 'lucide-react';
import { Analytics } from '@/src/types';
import { useState } from 'react';

interface TrafficAnalyticsProps {
  sourceSummary: Analytics['sourceSummary'];
  countrySummary: Analytics['countrySummary'];
}

function getSharePercent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

const GEO_COLORS = [
  '#16a34a', '#22c55e', '#4ade80', '#86efac',
  '#059669', '#34d399', '#6ee7b7', '#a7f3d0',
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function DonutChart({ data }: { data: Analytics['countrySummary'] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = data.reduce((s, d) => s + d.views, 0);
  if (data.length === 0) return <p className="text-sm text-gray-400 py-4">No country data yet.</p>;

  const cx = 110;
  const cy = 110;
  const outerR = 90;
  const innerR = 62;
  const gap = 2; // degrees gap between segments

  // Build segments
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
    <div>
      <div className="flex justify-center">
        <svg width={220} height={220} viewBox="0 0 220 220">
          {segments.map((seg, i) => {
            const isActive = i === activeIndex;
            const r = isActive ? outerR + 5 : outerR;
            const iR = isActive ? innerR - 3 : innerR;
            const outerPath = arcPath(cx, cy, r, seg.start, seg.end);
            const innerPath = arcPath(cx, cy, iR, seg.start, seg.end);
            const startOuter = polarToCartesian(cx, cy, r, seg.end);
            const startInner = polarToCartesian(cx, cy, iR, seg.end);
            const endOuter = polarToCartesian(cx, cy, r, seg.start);
            const endInner = polarToCartesian(cx, cy, iR, seg.start);
            const largeArc = seg.end - seg.start > 180 ? 1 : 0;

            const d = [
              `M ${startOuter.x} ${startOuter.y}`,
              `A ${r} ${r} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y}`,
              `L ${endInner.x} ${endInner.y}`,
              `A ${iR} ${iR} 0 ${largeArc} 1 ${startInner.x} ${startInner.y}`,
              'Z',
            ].join(' ');

            return (
              <path
                key={i}
                d={d}
                fill={seg.color}
                opacity={isActive ? 1 : 0.65}
                style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={() => setActiveIndex(i)}
              />
            );
          })}

          {/* Center label */}
          <text x={cx} y={cy - 12} textAnchor="middle" fill="#111827" style={{ fontSize: 11, fontWeight: 700 }}>
            {active.item.country}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="#111827" style={{ fontSize: 26, fontWeight: 900 }}>
            {activePercent}%
          </text>
          <text x={cx} y={cy + 27} textAnchor="middle" fill="#6b7280" style={{ fontSize: 10 }}>
            {active.item.views}v · {active.item.clicks}c
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-1">
        {data.map((item, index) => (
          <div
            key={item.country}
            className={`flex items-center gap-3 py-2 border-b border-gray-50 last:border-0 cursor-pointer transition-opacity ${activeIndex === index ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}
            onMouseEnter={() => setActiveIndex(index)}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: GEO_COLORS[index % GEO_COLORS.length] }} />
            <span className="flex-1 text-sm font-medium text-gray-900">{item.country}</span>
            <span className="text-xs text-gray-400">{item.views} views</span>
            <span className="text-xs font-semibold text-gray-700 w-10 text-right">{getSharePercent(item.views, total)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrafficAnalytics({ sourceSummary, countrySummary }: TrafficAnalyticsProps) {
  return (
    <div className="flex flex-col gap-6">

      {/* Traffic Sources */}
      <div className="rounded-2xl border border-gray-100 bg-white" style={{ padding: '20px' }}>
        <div className="mb-4 flex items-center gap-3">
          <LinkIcon className="h-5 w-5 text-gray-400" />
          <div>
            <h3 className="text-base font-semibold text-gray-900">Traffic Sources</h3>
            <p className="text-sm text-gray-400">By platform.</p>
          </div>
        </div>

        {sourceSummary.length > 0 && (
          <div className="flex items-center gap-2 pb-2 mb-1 border-b border-gray-100">
            <span className="w-5 shrink-0" />
            <span className="flex-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Source</span>
            <span className="w-16 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Clicks</span>
            <span className="w-16 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Views</span>
            <span className="w-14 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide">CTR</span>
          </div>
        )}

        {sourceSummary.length > 0 ? sourceSummary.map((source, index) => {
          const ctr = source.views > 0 ? ((source.clicks / source.views) * 100).toFixed(0) : '0';
          return (
            <div key={source.source} className="flex items-center gap-2 border-b border-gray-50 last:border-0 py-2.5">
              <span className="text-xs text-gray-400 w-5 shrink-0">{index + 1}.</span>
              <span className="flex-1 font-medium capitalize text-gray-900 text-sm truncate">{source.source}</span>
              <span className="w-16 text-right text-sm text-gray-700">{source.clicks}</span>
              <span className="w-16 text-right text-sm text-gray-700">{source.views}</span>
              <span className="w-14 text-right text-sm font-semibold text-gray-900">{ctr}%</span>
            </div>
          );
        }) : (
          <p className="text-sm text-gray-400 py-4">No source data yet.</p>
        )}
      </div>

      {/* Audience Geography */}
      <div className="rounded-2xl border border-gray-100 bg-white" style={{ padding: '20px' }}>
        <div className="mb-4 flex items-center gap-3">
          <Globe className="h-5 w-5 text-gray-400" />
          <div>
            <h3 className="text-base font-semibold text-gray-900">Audience Geography</h3>
            <p className="text-sm text-gray-400">By location.</p>
          </div>
        </div>
        <DonutChart data={countrySummary} />
      </div>

    </div>
  );
}
