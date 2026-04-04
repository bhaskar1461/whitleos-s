import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import type { User } from "@/lib/types";

type LoginInput = {
  email: string;
  password: string;
};

type SignupInput = LoginInput & {
  name: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<User>;
  signup: (input: SignupInput) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const response = await apiFetch<{ user: User }>("/api/user/me");
      setUser(response.user);
      return response.user;
    } catch {
      setUser(null);
      return null;
    }
  }

  async function login(input: LoginInput) {
    const response = await apiFetch<{ user: User; message: string }>("/api/auth/login", {
      method: "POST",
      body: input,
    });
    setUser(response.user);
    return response.user;
  }

  async function signup(input: SignupInput) {
    const response = await apiFetch<{ user: User; message: string }>("/api/auth/signup", {
      method: "POST",
      body: input,
    });
    setUser(response.user);
    return response.user;
  }

  async function logout() {
    try {
      await apiFetch<{ message: string }>("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      setUser(null);
    }
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      await refreshUser();
      if (active) {
        setLoading(false);
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
