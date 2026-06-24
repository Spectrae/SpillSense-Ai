'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Explicitly define the props interface so TypeScript knows what to expect
interface MapInterfaceProps {
  onWktGenerated: (wkt: string) => void;
}

// Pass the interface to dynamic<> and use the @/ alias defined in tsconfig.json
const MapInterface = dynamic<MapInterfaceProps>(
  () => import('@/components/MapInterface'),
  { ssr: false }
);

interface ROI {
  id: number;
  name: string;
  is_monitoring: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [wkt, setWkt] = useState('');
  const [roiName, setRoiName] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeRois, setActiveRois] = useState<ROI[]>([]);

  // Memoized fetch function to pull user data
  const fetchROIs = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/rois', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setActiveRois(result.data);
      } else if (res.status === 401) {
        localStorage.removeItem('access_token');
        router.push('/login');
      }
    } catch (error) {
      console.error("Failed to fetch ROIs", error);
    }
  }, [router]);

  useEffect(() => {
    fetchROIs();
  }, [fetchROIs]);

  const handleSaveROI = async () => {
    // CRITICAL FIX: Split the validation so the user knows EXACTLY why it is failing
    if (!wkt) {
      alert('⚠️ Missing Data: Please draw a region on the map first. The polygon coordinates cannot be empty.');
      return;
    }
    if (!roiName) {
      alert('⚠️ Missing Data: Please type a name for your region in the text box (e.g., "Mumbai Coast Refinery").');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('access_token');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/rois', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: roiName, wkt_polygon: wkt })
      });

      if (res.ok) {
        alert('✅ Region successfully registered for live tracking.');
        setRoiName('');
        setWkt('');
        fetchROIs(); // Refresh the table automatically
      } else {
        const errData = await res.json();
        alert(`❌ Failed to save: ${errData.detail || 'Unknown server error'}`);
      }
    } catch (err: any) {
      alert(`❌ Network Error: Could not reach the backend. Ensure FastAPI is running. Details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-[#121212] text-white">
      {/* LEFT PANEL: Map Interface */}
      <div className="flex-1 p-6 relative flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-[#ffffff]">SpillSense-Ai // Analytical Control Center</h1>
          <button 
            onClick={handleLogout} 
            className="bg-[#d32f2f] hover:bg-[#b71c1c] text-white px-4 py-1.5 rounded text-sm font-bold transition-colors"
          >
            Logout
          </button>
        </div>
        <div className="flex-1">
          <MapInterface onWktGenerated={(generatedWkt: string) => setWkt(generatedWkt)} />
        </div>
      </div>

      {/* RIGHT PANEL: Controls & Data Table */}
      <div className="w-[450px] bg-[#1a1a1a] border-l border-[#2d2d2d] p-6 flex flex-col gap-6 overflow-y-auto">
        
        {/* Registration Card */}
        <div className="bg-[#242424] p-4 rounded border border-[#2d2d2d]">
          <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-2 font-semibold">1. Define New Region</h2>
          <input 
            type="text" placeholder="e.g., Mumbai Coast Refinery" value={roiName}
            className="w-full p-2 bg-[#121212] border border-[#3d3d3d] rounded text-white mb-3 text-sm focus:outline-none focus:border-[#0066cc]"
            onChange={(e) => setRoiName(e.target.value)}
          />
          <textarea 
            readOnly value={wkt} placeholder="Awaiting manual bounding box draw interaction..."
            className="w-full h-24 bg-[#121212] border border-[#3d3d3d] rounded text-xs p-2 font-mono text-[#00ff66] resize-none"
          />
          <button 
            onClick={handleSaveROI} disabled={loading}
            className="w-full mt-3 bg-[#0066cc] py-2 rounded font-bold text-sm text-white hover:bg-[#0052a3] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Committing Storage...' : 'Save Monitoring Bound'}
          </button>
        </div>

        {/* Active Monitors Table */}
        <div className="bg-[#242424] p-4 rounded border border-[#2d2d2d] flex-1">
          <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-4 font-semibold">2. Active Pipeline Monitors</h2>
          
          {activeRois.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No regions currently being monitored.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {activeRois.map((roi) => (
                <div key={roi.id} className="bg-[#121212] p-3 rounded border border-[#3d3d3d] flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-sm text-[#e0e0e0]">{roi.name}</h3>
                    <span className="text-[10px] text-[#00ff66] uppercase tracking-widest">
                      {roi.is_monitoring ? '● Scanning Active' : '○ Paused'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">ID: {roi.id}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}