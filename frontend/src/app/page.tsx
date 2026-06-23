"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [wkt, setWkt] = useState("POLYGON((...))"); 
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("spillsense_token");
    if (!token) {
      router.push("/login"); // Redirect to login if no token is found
    }
  }, [router]);

  const handleTriggerPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const token = localStorage.getItem("spillsense_token");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/trigger-pipeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ wkt: wkt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to save target to database");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("spillsense_token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">SpillSense-Ai Dashboard</h1>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold transition">
            Logout
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Add Region to Monitoring Queue</h2>
          <form onSubmit={handleTriggerPipeline}>
            <label className="block text-sm text-gray-400 mb-2">Target Region (WKT Polygon Format)</label>
            <textarea
              value={wkt}
              onChange={(e) => setWkt(e.target.value)}
              rows={4}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 mb-4 font-mono text-sm"
              placeholder="POLYGON((longitude latitude, ...))"
            />
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3 rounded font-bold transition ${loading ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? "Planting Target in Database..." : "Start Monitoring Region"}
            </button>
          </form>
        </div>

        {/* Status / Results Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 p-4 rounded text-red-200 mb-4">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-900/30 border border-green-500 p-6 rounded">
            <h3 className="text-xl font-bold text-green-400 mb-2">Target Status: {result.status}</h3>
            <p className="mb-4 text-gray-300">{result.message}</p>
            
            {result.data_found && (
              <div className="bg-gray-900 p-4 rounded font-mono text-sm overflow-x-auto">
                <p><span className="text-blue-400">Scene Name:</span> {result.scene_name}</p>
                <p><span className="text-blue-400">Storage Path:</span> {result.storage_path}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}