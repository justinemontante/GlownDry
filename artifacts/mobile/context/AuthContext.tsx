import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface CustomerProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  totalOrders: number;
  profileImage?: string | null;
  createdAt: string;
}

interface AuthContextValue {
  customer: CustomerProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, customer: CustomerProfile) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<CustomerProfile>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "glowndry_token";
const CUSTOMER_KEY = "glowndry_customer";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [storedToken, storedCustomer] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(CUSTOMER_KEY),
        ]);
        if (storedToken && storedCustomer) {
          setToken(storedToken);
          setCustomer(JSON.parse(storedCustomer) as CustomerProfile);
          setAuthTokenGetter(() => storedToken);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const login = useCallback(async (newToken: string, newCustomer: CustomerProfile) => {
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, newToken),
      AsyncStorage.setItem(CUSTOMER_KEY, JSON.stringify(newCustomer)),
    ]);
    setToken(newToken);
    setCustomer(newCustomer);
    setAuthTokenGetter(() => newToken);
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(CUSTOMER_KEY),
    ]);
    setToken(null);
    setCustomer(null);
    setAuthTokenGetter(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<CustomerProfile>) => {
    setCustomer(prev => prev ? { ...prev, ...updates } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ customer, token, isLoading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
