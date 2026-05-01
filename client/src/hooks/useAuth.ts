import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  userType: string;
  phone?: string;
  location?: string;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) return null;
        const data = await res.json();
        return data || null;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 60 * 1000,
  });

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      // ignore
    }
    // Hard navigate to home - this fully resets the JS runtime and all cached state
    window.location.href = "/?loggedout=1";
  };

  return {
    user: user || null,
    isLoading,
    isLoggedIn: !!user,
    logout,
  };
}
