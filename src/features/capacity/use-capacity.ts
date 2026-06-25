import { useQuery } from '@tanstack/react-query';
import { MOCK_CAPACITY } from '@/lib/mock-data';
import type { MonthlyCapacity } from '@/types';

// Phase 1: returns mock capacity through React Query so the wiring is
// real and Phase 2 only swaps the queryFn for a Supabase call.
export function useCapacity() {
  return useQuery<MonthlyCapacity[]>({
    queryKey: ['capacity', 'current-month'],
    queryFn: async () => MOCK_CAPACITY,
  });
}
