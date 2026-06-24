'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        // CRITICAL FIX: The key must exactly match what the dashboard is looking for
        localStorage.setItem('access_token', data.access_token);
        
        // CRITICAL FIX: Redirect directly to the dashboard workspace
        router.push('/dashboard');
      } else {
        setError(data.detail || 'Invalid credentials. Check your email and password.');
      }
    } catch (err) {
      setError('Connection refused. Is your FastAPI backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] text-white">
      <form onSubmit={handleLogin} className="flex flex-col gap-4 bg-[#1a1a1a] p-8 rounded-lg border border-[#2d2d2d] w-96 shadow-xl">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-[#ffffff]">SpillSense-Ai</h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Authentication Gateway</p>
        </div>

        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 text-sm p-3 rounded">{error}</div>}

        <input 
          type="email" placeholder="Email Address" required value={email}
          className="p-3 bg-[#242424] border border-[#3d3d3d] rounded text-sm focus:outline-none focus:border-[#0066cc]"
          onChange={e => setEmail(e.target.value)} 
        />
        <input 
          type="password" placeholder="Password" required value={password}
          className="p-3 bg-[#242424] border border-[#3d3d3d] rounded text-sm focus:outline-none focus:border-[#0066cc]"
          onChange={e => setPassword(e.target.value)} 
        />
        
        <button 
          type="submit" disabled={loading}
          className="mt-2 bg-[#0066cc] p-3 rounded font-bold text-sm hover:bg-[#0052a3] disabled:opacity-50 transition-colors"
        >
          {loading ? 'Authenticating...' : 'Secure Login'}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          No clearance? <Link href="/register" className="text-[#0066cc] hover:underline">Register here</Link>
        </p>
      </form>
    </div>
  );
}