import { ExternalLink, CheckCircle, XCircle, MapPin, Calendar } from 'lucide-react';

interface Comp {
  title: string;
  url: string;
  image_url: string;
  sold_price: number;
  shipping: number;
  location: string;
  total_used: number;
  sold_date?: string;
  included: boolean;
  exclusion_reason?: string;
  match_score?: number;
  extracted_fields?: any;
}

interface CompGalleryProps {
  comps: Comp[];
}

export default function CompGallery({ comps }: CompGalleryProps) {
  const includedComps = comps.filter(c => c.included);
  const excludedComps = comps.filter(c => !c.included);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const CompCard = ({ comp, isExcluded = false }: { comp: Comp; isExcluded?: boolean }) => (
    <div
      className={`bg-white rounded-lg border overflow-hidden transition-all ${
        isExcluded
          ? 'opacity-60 border-slate-200 hover:opacity-80'
          : 'border-slate-300 hover:shadow-lg'
      }`}
    >
      <div className="relative">
        {comp.image_url && comp.image_url !== 'N/A' ? (
          <img
            src={comp.image_url}
            alt={comp.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23f1f5f9" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%2394a3b8"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="w-full h-48 bg-slate-100 flex items-center justify-center">
            <span className="text-slate-400 text-sm">No Image</span>
          </div>
        )}

        <div className="absolute top-2 right-2">
          {isExcluded ? (
            <div className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              Excluded
            </div>
          ) : (
            <div className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Included
            </div>
          )}
        </div>

        {comp.match_score !== undefined && (
          <div className="absolute top-2 left-2">
            <div className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
              {comp.match_score}% Match
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium text-slate-900 line-clamp-2 mb-3 min-h-[2.5rem]">
          {comp.title}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Item Price:</span>
            <span className="font-semibold text-slate-900">${comp.sold_price.toFixed(2)}</span>
          </div>

          {comp.shipping > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Shipping:</span>
              <span className="font-semibold text-slate-900">${comp.shipping.toFixed(2)}</span>
            </div>
          )}

          {!isExcluded && (
            <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200">
              <span className="text-slate-600 font-medium">Total Used:</span>
              <span className="font-bold text-green-600 text-lg">${comp.total_used.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="space-y-2 mb-4 pt-3 border-t border-slate-200">
          {comp.location && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <MapPin className="w-3 h-3" />
              {comp.location}
            </div>
          )}

          {comp.sold_date && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Calendar className="w-3 h-3" />
              {formatDate(comp.sold_date)}
            </div>
          )}
        </div>

        {isExcluded && comp.exclusion_reason && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <div className="text-xs font-medium text-red-900 mb-1">Exclusion Reason:</div>
            <div className="text-xs text-red-700">{comp.exclusion_reason}</div>
          </div>
        )}

        {!isExcluded && comp.extracted_fields && Object.keys(comp.extracted_fields).length > 0 && (
          <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded">
            <div className="text-xs font-medium text-slate-700 mb-2">Extracted Details:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(comp.extracted_fields).slice(0, 6).map(([key, value]) => (
                <div key={key}>
                  <span className="text-slate-500">{key}:</span>
                  <span className="ml-1 text-slate-700 font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {comp.url && comp.url !== 'N/A' && (
          <a
            href={comp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View on eBay
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {includedComps.length > 0 && (
        <div>
          <div className="bg-white rounded-lg border border-green-200 p-4 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Included Comps ({includedComps.length})
              </h2>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              These listings were used to calculate the market price
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {includedComps.map((comp, idx) => (
              <CompCard key={idx} comp={comp} />
            ))}
          </div>
        </div>
      )}

      {excludedComps.length > 0 && (
        <div>
          <div className="bg-white rounded-lg border border-red-200 p-4 mb-6">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Excluded Comps ({excludedComps.length})
              </h2>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              These listings were filtered out and not used in pricing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {excludedComps.map((comp, idx) => (
              <CompCard key={idx} comp={comp} isExcluded />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
