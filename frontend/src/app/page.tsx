'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      // No token found? Boot them to the login screen immediately
      router.push('/login');
    } else {
      // Token found? Send them to the graphical map interface
      router.push('/dashboard');
    }
  }, [router]);

  // A brief loading screen while the router makes the decision
  return (
    <div className="flex h-screen items-center justify-center bg-[#121212] text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-[#0066cc] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">Initializing SpillSense-Ai...</p>
      </div>
    </div>
  );
}