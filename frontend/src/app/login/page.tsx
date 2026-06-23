"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Logging in...");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password: password }),
      });

      if (!response.ok) throw new Error("Login failed. Check credentials.");

      const data = await response.json();
      localStorage.setItem("spillsense_token", data.access_token);
      
      setMessage("Login successful!");
      router.push("/"); // Redirect to dashboard after login
      
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">SpillSense-Ai Login</h2>
        <input type="text" placeholder="Email (e.g. admin@example.com)" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 mb-4 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 mb-6 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500" />
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">Login</button>
        {message && <p className="mt-4 text-center text-sm text-yellow-400">{message}</p>}
      </form>
    </div>
  );
}