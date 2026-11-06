"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
export default function Home() {
  const [text, setText] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleProcess = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResponse(null);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/process-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_report_text: text })
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ status: "network_error", simplified_report: "Server connection failed." });
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e1e2d] text-white flex flex-col m-4 rounded-xl shadow-xl hidden md:flex">
        <div className="p-6 border-b border-gray-700/50 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">M</div>
          <span className="font-bold tracking-wider text-sm">MEDISIMPLIFY</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-md shadow-blue-500/20 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <button className="w-full flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-4 py-3 rounded-lg transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span className="text-sm font-medium">Reports</span>
          </button>
          <button className="w-full flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-4 py-3 rounded-lg transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            <span className="text-sm font-medium">Security Logs</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 overflow-y-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center py-4 px-2 mb-4">
          <div>
            <div className="text-xs text-gray-500 font-medium tracking-wide mb-1">Pages / Dashboard</div>
            <h1 className="text-xl font-bold text-gray-800">Analyzer Console</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              FastAPI Online
            </div>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
            <div>
              <p className="text-sm text-gray-500 font-medium">Reports Processed</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">1,204</h3>
              <p className="text-xs text-green-500 font-medium mt-2">+12% from last week</p>
            </div>
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-lg absolute -top-4 right-4 translate-y-8">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
            <div>
              <p className="text-sm text-gray-500 font-medium">PII Entities Masked</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">4,390</h3>
              <p className="text-xs text-green-500 font-medium mt-2">+5% from yesterday</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg absolute -top-4 right-4 translate-y-8">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
            <div>
              <p className="text-sm text-gray-500 font-medium">Guardrail Blocks</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">84</h3>
              <p className="text-xs text-red-500 font-medium mt-2">Requires review</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg absolute -top-4 right-4 translate-y-8">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
          </div>
        </div>

        {/* Translation Module */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-1">New Translation Request</h2>
          <p className="text-sm text-gray-500 mb-4">Enter clinical text to mask PII and extract medical definitions.</p>
          
          <textarea
            className="w-full p-4 border border-gray-200 rounded-lg h-40 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
            placeholder="Patient presents with..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
          />
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleProcess}
              disabled={loading || !text.trim()}
              className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-2.5 rounded-lg text-sm shadow-md shadow-gray-900/20 disabled:opacity-50 flex items-center transition-all"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? "Processing via API..." : "Run Security & Simplify"}
            </button>
          </div>

          {/* Results Area */}
          {response && (
            <div className={`mt-6 p-5 rounded-lg border transition-all ${
              response.status === 'blocked' ? 'bg-red-50/50 border-red-100' : 
              response.status === 'network_error' ? 'bg-orange-50/50 border-orange-100' : 
              'bg-blue-50/50 border-blue-100'
            }`}>
              <div className="flex items-center mb-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                  response.status === 'success' ? 'bg-blue-100 text-blue-700' :
                  response.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {response.status === 'success' ? 'Output Generated' : response.status === 'blocked' ? 'Guardrail Blocked' : 'System Error'}
                </span>
              </div>

              <div className="text-sm text-gray-700 leading-relaxed prose prose-blue max-w-none">
                <ReactMarkdown>{response.simplified_report}</ReactMarkdown>
              </div>
              
              {response.pii_mapping && Object.keys(response.pii_mapping).length > 0 && (
                <div className="mt-5 pt-5 border-t border-gray-200/50">
                  <p className="text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-wider">Presidio Masking Ledger</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {Object.entries(response.pii_mapping).map(([tag, originalValue]) => (
                      <div key={tag} className="bg-white p-2.5 rounded border border-gray-100 shadow-sm flex flex-col">
                        <span className="text-[10px] font-mono text-gray-400">{tag}</span>
                        <span className="text-xs font-medium text-gray-800 truncate">{originalValue as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}