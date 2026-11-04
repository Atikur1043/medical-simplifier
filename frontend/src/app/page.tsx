"use client";
import { useState } from "react";

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
      console.error(err);
      setResponse({ 
        status: "error", 
        simplified_report: "Failed to connect to the backend server. Make sure FastAPI is running." 
      });
    }
    setLoading(false);
  };

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Medical Report Simplifier</h1>
      
      <textarea
        className="w-full p-4 border border-gray-300 rounded-lg mb-4 h-48 text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="Paste the medical report here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      
      <button
        onClick={handleProcess}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50 transition-colors"
      >
        {loading ? "Processing..." : "Simplify Report"}
      </button>

      {response && (
        <div className={`mt-8 p-6 rounded-lg border text-black ${response.status === 'blocked' || response.status === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <h2 className="font-semibold text-lg mb-2">
            {response.status === 'blocked' ? 'Security Guardrail Triggered' : 'Result'}
          </h2>
          <p className="mb-4 whitespace-pre-wrap">{response.simplified_report}</p>
          
          {response.pii_mapping && Object.keys(response.pii_mapping).length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Masked PII Entities:</h3>
              <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
                {JSON.stringify(response.pii_mapping, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </main>
  );
}