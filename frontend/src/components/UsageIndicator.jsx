import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

// resourceKey: 'products' | 'services' | 'gallery' | 'videos'
const UsageIndicator = ({ usage, resourceKey, label }) => {
  if (!usage) return null;
  const stat = usage[resourceKey];
  if (!stat) return null;

  const { used, limit } = stat;
  const unlimited = limit == null || limit < 0;
  const isFull = !unlimited && used >= limit;
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));

  return (
    <div className="bg-white rounded-lg px-4 py-3 shadow-sm flex items-center gap-4 flex-wrap">
      <div className="flex-1 min-w-[160px]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-600">{label} used</span>
          <span className={`text-sm font-semibold ${isFull ? 'text-red-600' : 'text-gray-700'}`}>
            {used} / {unlimited ? '∞' : limit}
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-indigo-500'}`}
            style={{ width: unlimited ? '8%' : `${pct}%` }}
          />
        </div>
      </div>
      {isFull && (
        <Link
          to="/dashboard/subscription"
          className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition"
        >
          <FaExclamationTriangle />
          Limit reached — Upgrade
        </Link>
      )}
    </div>
  );
};

export default UsageIndicator;
