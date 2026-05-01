import { useLocation } from "wouter";
import { useAuth } from "./useAuth";
import { useState } from "react";

export function usePostJob() {
  const { isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  const handlePostJob = () => {
    if (!isLoggedIn) {
      setLocation("/auth");
    } else {
      setIsJobModalOpen(true);
    }
  };

  return { handlePostJob, isJobModalOpen, setIsJobModalOpen };
}
