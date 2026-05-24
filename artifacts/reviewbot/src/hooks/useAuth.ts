import { useEffect, useState } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/auth/me`, { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json() as Promise<AuthUser>;
        throw new Error("not authenticated");
      })
      .then((user) => setState({ user, loading: false, isAuthenticated: true }))
      .catch(() => setState({ user: null, loading: false, isAuthenticated: false }));
  }, []);

  return state;
}

export function signOut() {
  return fetch(`${import.meta.env.BASE_URL}api/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).then(() => {
    window.location.href = "/";
  });
}

export function signInWithGoogle() {
  window.location.href = `${import.meta.env.BASE_URL}api/auth/google`;
}
