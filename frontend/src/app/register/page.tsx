'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '', whatsapp_number: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://127.0.0.1:8000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      alert('Registration successful! Please login.');
      router.push('/login');
    } else {
      const error = await res.json();
      alert(`Error: ${error.detail}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] text-white">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-[#1a1a1a] p-8 rounded-lg border border-[#2d2d2d] w-96">
        <h2 className="text-xl font-bold mb-4">Register for SpillSense-Ai</h2>
        <input 
          type="email" placeholder="Email" required
          className="p-2 bg-[#242424] border border-[#3d3d3d] rounded"
          onChange={e => setFormData({...formData, email: e.target.value})} 
        />
        <input 
          type="password" placeholder="Password" required
          className="p-2 bg-[#242424] border border-[#3d3d3d] rounded"
          onChange={e => setFormData({...formData, password: e.target.value})} 
        />
        <input 
          type="text" placeholder="WhatsApp Number (+1234567890)" required
          className="p-2 bg-[#242424] border border-[#3d3d3d] rounded"
          onChange={e => setFormData({...formData, whatsapp_number: e.target.value})} 
        />
        <button type="submit" className="bg-[#0066cc] p-2 rounded font-bold hover:bg-[#0052a3]">Register</button>
      </form>
    </div>
  );
}