import { Globe, Link as LinkIcon, MapPinned } from 'lucide-react';
import { Analytics } from '@/src/types';

interface TrafficAnalyticsProps {
  sourceSummary: Analytics['sourceSummary'];
  countrySummary: Analytics['countrySummary'];
}

function getShareLabel(value: number, total: number) {
  if (total <= 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export function TrafficAnalytics({ sourceSummary, countrySummary }: TrafficAnalyticsProps) {
  const totalSourceTraffic = sourceSummary.reduce((sum, item) => sum + item.views, 0);
  const totalCountryTraffic = countrySummary.reduce((sum, item) => sum + item.views, 0);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-brand- p-2 text-brand-">
            <LinkIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Traffic Sources</h3>
            <p className="mt-1 text-sm text-gray-500">By platform.</p>
          </div>
        </div>

        <div className="space-y-3">
          {sourceSummary.length > 0 ? sourceSummary.map((source, index) => (
            <div key={source.source} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-gray-700 shadow-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold capitalize text-gray-900">{source.source}</p>
                    <p className="mt-1 text-sm text-gray-500">{source.views} views</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-gray-900">{getShareLabel(source.views, totalSourceTraffic)}</p>
                  <p className="text-xs text-gray-500">{source.clicks} clicks</p>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white ring-1 ring-gray-100">
                <div
                  className="h-2 rounded-full bg-brand-"
                  style={{ width: getShareLabel(source.views, totalSourceTraffic) }}
                />
              </div>
            </div>
          )) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
              No source data yet.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Audience Geography</h3>
            <p className="mt-1 text-sm text-gray-500">By location.</p>
          </div>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Top Market</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{countrySummary[0]?.country ?? 'N/A'}</p>
            <p className="mt-1 text-sm text-gray-600">{countrySummary[0]?.views ?? 0} views</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPinned className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em]">Tracked Countries</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">{countrySummary.length}</p>
            <p className="mt-1 text-sm text-gray-600">Countries with tracked traffic.</p>
          </div>
        </div>

        <div className="space-y-3">
          {countrySummary.length > 0 ? countrySummary.map((country, index) => (
            <div key={country.country} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-gray-700 shadow-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{country.country}</p>
                    <p className="mt-1 text-sm text-gray-500">{country.views} views</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-gray-900">{getShareLabel(country.views, totalCountryTraffic)}</p>
                  <p className="text-xs text-gray-500">{country.clicks} clicks</p>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white ring-1 ring-gray-100">
                <div
                  className="h-2 rounded-full bg-emerald-600"
                  style={{ width: getShareLabel(country.views, totalCountryTraffic) }}
                />
              </div>
            </div>
          )) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
              No country data yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
