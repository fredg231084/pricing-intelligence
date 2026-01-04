import { TrendingUp, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface PriceSummaryProps {
  summary: {
    median_price: number;
    p25_price: number;
    p75_price: number;
    currency: string;
    confidence_score: number;
    confidence_label: string;
    comps_used: number;
    comps_excluded: number;
    notes?: string[];
  };
  query: string;
}

export default function PriceSummary({ summary, query }: PriceSummaryProps) {
  const getConfidenceColor = (label: string) => {
    switch (label.toLowerCase()) {
      case 'high':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getConfidenceIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'high':
        return <CheckCircle className="w-5 h-5" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5" />;
      case 'low':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-medium text-blue-100 mb-1">Market Price for</h2>
            <p className="text-xl font-bold">{query}</p>
          </div>
          <TrendingUp className="w-8 h-8 text-blue-200" />
        </div>
      </div>

      <div className="p-8">
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
            <div className="text-sm font-medium text-blue-600 mb-2">Median Price</div>
            <div className="text-4xl font-bold text-slate-900">
              {summary.currency} ${summary.median_price.toFixed(2)}
            </div>
          </div>

          <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-sm font-medium text-slate-600 mb-2">Price Range</div>
            <div className="text-2xl font-bold text-slate-900">
              ${summary.p25_price.toFixed(2)} - ${summary.p75_price.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mt-1">25th - 75th percentile</div>
          </div>

          <div className={`text-center p-6 rounded-xl border ${getConfidenceColor(summary.confidence_label)}`}>
            <div className="text-sm font-medium mb-2">Confidence</div>
            <div className="flex items-center justify-center gap-2">
              {getConfidenceIcon(summary.confidence_label)}
              <div className="text-2xl font-bold">{summary.confidence_label}</div>
            </div>
            <div className="text-sm mt-1">{summary.confidence_score}/100</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-green-600 font-medium">Comps Used</div>
            <div className="text-3xl font-bold text-green-700">{summary.comps_used}</div>
          </div>

          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-sm text-red-600 font-medium">Comps Excluded</div>
            <div className="text-3xl font-bold text-red-700">{summary.comps_excluded}</div>
          </div>
        </div>

        {summary.notes && summary.notes.length > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900 mb-2">Analysis Notes:</div>
                <ul className="space-y-1 text-sm text-blue-800">
                  {summary.notes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
