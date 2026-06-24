'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '', whatsapp_number: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        alert('Registration successful! Redirecting to login...');
        router.push('/login');
      } else {
        setError(data.detail || 'Registration failed');
      }
    } catch (err) {
      setError('Connection refused. Is your FastAPI backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] text-white">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-[#1a1a1a] p-8 rounded-lg border border-[#2d2d2d] w-96 shadow-xl">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-[#ffffff]">SpillSense-Ai</h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Operator Registration</p>
        </div>

        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 text-sm p-3 rounded">{error}</div>}

        <input 
          type="email" placeholder="Email Address" required
          className="p-3 bg-[#242424] border border-[#3d3d3d] rounded text-sm focus:outline-none focus:border-[#0066cc]"
          onChange={e => setFormData({...formData, email: e.target.value})} 
        />
        <input 
          type="password" placeholder="Password" required
          className="p-3 bg-[#242424] border border-[#3d3d3d] rounded text-sm focus:outline-none focus:border-[#0066cc]"
          onChange={e => setFormData({...formData, password: e.target.value})} 
        />
        <div className="relative">
          <input 
            type="text" placeholder="WhatsApp (e.g., +14155552671)" required
            className="w-full p-3 bg-[#242424] border border-[#3d3d3d] rounded text-sm focus:outline-none focus:border-[#0066cc]"
            onChange={e => setFormData({...formData, whatsapp_number: e.target.value})} 
          />
          <p className="text-[10px] text-gray-500 mt-1">Include country code for Twilio alerts.</p>
        </div>

        <button 
          type="submit" disabled={loading}
          className="mt-2 bg-[#0066cc] p-3 rounded font-bold text-sm hover:bg-[#0052a3] disabled:opacity-50 transition-colors"
        >
          {loading ? 'Registering...' : 'Request Clearance'}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Already registered? <Link href="/login" className="text-[#0066cc] hover:underline">Log in here</Link>
        </p>
      </form>
    </div>
  );
}