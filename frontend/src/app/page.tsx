"use client";
import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [text, setText] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ocr-report`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.error) {
        alert(data.error);
      } else {
        setText(data.extracted_text);
      }
    } catch (err) {
      alert("Failed to upload and extract text.");
    }
    
    setOcrLoading(false);
    // Reset input so the same file can be uploaded again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 overflow-y-auto">
        
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

        {/* Translation Module */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-5xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">New Translation Request</h2>
              <p className="text-sm text-gray-500">Enter clinical text or upload a scanned report (PDF/Image).</p>
            </div>
            
            {/* Upload Button */}
            <div>
              <input 
                type="file" 
                accept="image/*,application/pdf" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={ocrLoading}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
              >
                {ocrLoading ? (
                  <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                )}
                {ocrLoading ? "Extracting..." : "Upload File"}
              </button>
            </div>
          </div>
          
          <textarea
            className="w-full p-4 border border-gray-200 rounded-lg h-40 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
            placeholder="Patient presents with... or click 'Upload File' to scan a report."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading || ocrLoading}
          />
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleProcess}
              disabled={loading || !text.trim()}
              className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-2.5 rounded-lg text-sm shadow-md shadow-gray-900/20 disabled:opacity-50 flex items-center transition-all"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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