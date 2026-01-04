import { Settings as SettingsIcon } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Pricing Intelligence</h1>
          <a
            href="#settings"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
            Settings
          </a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Find True Market Prices
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              AI-powered pricing intelligence that analyzes eBay sold listings like a human expert.
              Get clean, accurate market prices with full transparency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <a
              href="#hockey"
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 hover:border-blue-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50 group-hover:opacity-75 transition-opacity"></div>

              <div className="relative p-8">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-4xl">🏒</span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  Hockey Cards
                </h3>

                <p className="text-slate-600 mb-4">
                  Analyze hockey card values with intelligent filtering that understands grading,
                  sets, parallels, and player-specific variations.
                </p>

                <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                  Start Pricing
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            <a
              href="#macbook"
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 hover:border-slate-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-zinc-50 opacity-50 group-hover:opacity-75 transition-opacity"></div>

              <div className="relative p-8">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-700 to-zinc-600 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-4xl">💻</span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  MacBooks
                </h3>

                <p className="text-slate-600 mb-4">
                  Get accurate MacBook valuations based on specs, condition, and market data.
                  Filters out parts, locked devices, and invalid listings.
                </p>

                <div className="flex items-center text-slate-700 font-medium group-hover:translate-x-1 transition-transform">
                  Start Pricing
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/60 backdrop-blur rounded-xl p-6 border border-slate-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">AI-Powered</div>
              <div className="text-sm text-slate-600">Intelligent filtering like a human expert</div>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-xl p-6 border border-slate-200">
              <div className="text-3xl font-bold text-green-600 mb-2">Transparent</div>
              <div className="text-sm text-slate-600">See every comp used and excluded</div>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-xl p-6 border border-slate-200">
              <div className="text-3xl font-bold text-amber-600 mb-2">Accurate</div>
              <div className="text-sm text-slate-600">Clean median prices you can trust</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
