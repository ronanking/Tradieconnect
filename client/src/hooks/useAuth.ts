import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
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
        return await res.json();
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { 
        method: "POST", 
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
    },
    onSettled: () => {
      // Always clear and redirect regardless of server response
      queryClient.clear();
      queryClient.removeQueries();
      setTimeout(() => { window.location.replace("/"); }, 100);
    },
  });

  return {
    user: user || null,
    isLoading,
    isLoggedIn: !!user,
    logout: () => logoutMutation.mutate(),
  };
}
