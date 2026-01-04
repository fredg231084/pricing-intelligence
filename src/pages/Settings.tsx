import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Settings {
  serpapi_key: string;
  llm_api_key: string;
  llm_provider: string;
  default_currency: string;
  default_region: string;
  use_ai_filtering: boolean;
}

export default function Settings() {
  const [settings, setSettings] = useState<Settings>({
    serpapi_key: '',
    llm_api_key: '',
    llm_provider: 'claude',
    default_currency: 'CAD',
    default_region: 'canada',
    use_ai_filtering: true,
  });
  const [originalKeys, setOriginalKeys] = useState({
    serpapi_key: '',
    llm_api_key: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSerpApi, setShowSerpApi] = useState(false);
  const [showLlmKey, setShowLlmKey] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/settings`;
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setOriginalKeys({
          serpapi_key: data.serpapi_key,
          llm_api_key: data.llm_api_key,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const payloadSettings = { ...settings };

      if (settings.serpapi_key === originalKeys.serpapi_key) {
        payloadSettings.serpapi_key = '';
      }
      if (settings.llm_api_key === originalKeys.llm_api_key) {
        payloadSettings.llm_api_key = '';
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/settings`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadSettings),
      });

      if (response.ok) {
        setMessage('Settings saved successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      setMessage('Error saving settings');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <a
            href="#home"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </a>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6">API Configuration</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    SerpApi API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showSerpApi ? 'text' : 'password'}
                      value={settings.serpapi_key}
                      onChange={(e) => setSettings({ ...settings, serpapi_key: e.target.value })}
                      className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your SerpApi key"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSerpApi(!showSerpApi)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showSerpApi ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Get your API key from <a href="https://serpapi.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">serpapi.com</a>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    LLM API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showLlmKey ? 'text' : 'password'}
                      value={settings.llm_api_key}
                      onChange={(e) => setSettings({ ...settings, llm_api_key: e.target.value })}
                      className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your Claude or GPT API key"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLlmKey(!showLlmKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showLlmKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Claude: <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.anthropic.com</a> |
                    GPT: <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">platform.openai.com</a>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    LLM Provider
                  </label>
                  <select
                    value={settings.llm_provider}
                    onChange={(e) => setSettings({ ...settings, llm_provider: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="claude">Claude (Anthropic)</option>
                    <option value="gpt">GPT (OpenAI)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Preferences</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Default Currency
                  </label>
                  <select
                    value={settings.default_currency}
                    onChange={(e) => setSettings({ ...settings, default_currency: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="CAD">CAD (Canadian Dollar)</option>
                    <option value="USD">USD (US Dollar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Default Valuation Region
                  </label>
                  <select
                    value={settings.default_region}
                    onChange={(e) => setSettings({ ...settings, default_region: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="canada">Canada (eBay.ca)</option>
                    <option value="usa">USA (eBay.com)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="font-medium text-slate-900">AI Filtering</div>
                    <div className="text-sm text-slate-600">Use LLM to intelligently filter listings</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, use_ai_filtering: !settings.use_ai_filtering })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.use_ai_filtering ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.use_ai_filtering ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            {message && (
              <div className={`text-sm font-medium ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                {message}
              </div>
            )}
            {!message && <div></div>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
