import { useQuery } from "@tanstack/react-query";

export interface JobCounts {
  [category: string]: number;
}

export function useJobCounts() {
  return useQuery<JobCounts>({
    queryKey: ["/api/jobs/counts-by-category"],
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    initialData: {},
  });
}