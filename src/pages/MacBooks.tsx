import { useState } from 'react';
import { ArrowLeft, Search, RefreshCw, TrendingUp, Info } from 'lucide-react';
import CompGallery from '../components/CompGallery';
import PriceSummary from '../components/PriceSummary';

interface SearchResult {
  summary: {
    median_price: number;
    p25_price: number;
    p75_price: number;
    currency: string;
    confidence_score: number;
    confidence_label: string;
    comps_used: number;
    comps_excluded: number;
    notes: string[];
  };
  comps: any[];
}

export default function MacBooks() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (forceRefresh = false) => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-price`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          type: 'macbook',
          forceRefresh,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch pricing data');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <a
            href="#home"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </a>
          <div className="flex items-center gap-3">
            <span className="text-2xl">💻</span>
            <h1 className="text-2xl font-bold text-slate-900">MacBook Pricing</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 mb-8">
          <div className="flex items-start gap-3 mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <Info className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-900">
              <p className="font-medium mb-1">Search Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>Include model, chip, RAM, and storage</li>
                <li>Example: "MacBook Pro 14 M3 Pro 18GB 512GB"</li>
                <li>Specify year or generation if known</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Query
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g., MacBook Pro 14 M3 Pro 18GB 512GB"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleSearch(false)}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Get Market Price
                  </>
                )}
              </button>

              {result && (
                <button
                  onClick={() => handleSearch(true)}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Refresh
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
              {error.includes('API keys not configured') && (
                <a href="#settings" className="text-sm text-red-600 hover:underline mt-2 inline-block">
                  Go to Settings →
                </a>
              )}
            </div>
          )}
        </div>

        {result && (
          <>
            <PriceSummary summary={result.summary} query={query} />
            <CompGallery comps={result.comps} />
          </>
        )}

        {!result && !loading && !error && (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Enter a search query to get started</p>
          </div>
        )}
      </main>
    </div>
  );
}
