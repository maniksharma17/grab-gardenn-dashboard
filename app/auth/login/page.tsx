'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    const validEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (email === validEmail && password === validPassword) {
      document.cookie = 'isLoggedIn=true; path=/';
      router.push('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-black mb-6">Admin Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-black px-4 py-2 w-full mb-3 text-black placeholder:text-gray-600"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-black px-4 py-2 w-full mb-3 text-black placeholder:text-gray-600"
        />
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <button
          onClick={handleLogin}
          className="bg-black text-white px-4 py-2 w-full rounded hover:opacity-90 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}
