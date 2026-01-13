"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// SIMULATED AUTH TYPES
type User = {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: any;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Helper to create a consistent UUID from a string (so logging in with same email = same user)
function generateUUID(email: string) {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = ((hash << 5) - hash) + email.charCodeAt(i);
    hash |= 0;
  }
  // Format as UUID-ish string (not real UUID but unique enough for this demo)
  // We want 8-4-4-4-12 hex format
  const hex = Math.abs(hash).toString(16).padEnd(32, '0');
  return `${hex.substr(0,8)}-${hex.substr(8,4)}-4${hex.substr(13,3)}-a${hex.substr(17,3)}-${hex.substr(20,12)}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check Local Storage on mount
    const stored = localStorage.getItem('simulated_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string) => {
    setLoading(true);
    // Simulate API delay for realism
    await new Promise(r => setTimeout(r, 600));
    
    // Create a deterministic "fake" user
    const newUser = {
      id: generateUUID(email),
      email,
      user_metadata: { full_name: email.split('@')[0] } 
    };
    
    setUser(newUser);
    localStorage.setItem('simulated_user', JSON.stringify(newUser));
    setLoading(false);
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('simulated_user');
    router.push('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
