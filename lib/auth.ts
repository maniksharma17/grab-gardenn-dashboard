'use client';

// Mock JWT token management
const TOKEN_KEY = 'grabgardenn_admin_token';

export async function loginAdmin(email: string, password: string): Promise<boolean> {
  try {
    // In a real implementation, this would call your backend API
    const response = await fetch('http://localhost:3001/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    
    // Store the JWT token in cookies
    document.cookie = `${TOKEN_KEY}=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
    
    return true;
  } catch (error) {
    console.error('Login error:', error);
    
    // For demo/development purposes, accept any credentials
    if (process.env.NODE_ENV !== 'production') {
      document.cookie = `${TOKEN_KEY}=mock_token_for_development; path=/; max-age=${60 * 60 * 24 * 7}`;
      return true;
    }
    
    return false;
  }
}

export async function logoutAdmin(): Promise<void> {
  // Clear the token cookie
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export async function checkAuth(): Promise<boolean> {
  try {
    const token = getToken();
    
    if (!token) {
      return false;
    }
    
    // In a real implementation, verify the token with your backend
    const response = await fetch('http://localhost:3001/api/admin/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.ok;
  } catch (error) {
    // For demo/development purposes, consider the user authenticated if a token exists
    if (process.env.NODE_ENV !== 'production') {
      const token = getToken();
      return !!token;
    }
    
    return false;
  }
}

export function getToken(): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === TOKEN_KEY) {
      return value;
    }
  }
  return null;
}

export function getAuthHeader(): HeadersInit {
  const token = getToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}