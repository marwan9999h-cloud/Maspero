import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import { AVAILABLE_MONTHS, DEFAULT_MONTH, getMembersForMonth } from '../data/dataLoader';

export function useActiveMonth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryMonth = searchParams.get('m');

  const selectedMonth = useMemo(() => {
    if (queryMonth && AVAILABLE_MONTHS.includes(queryMonth)) {
      return queryMonth;
    }
    return DEFAULT_MONTH || queryMonth || "";
  }, [queryMonth]);

  const setMonth = useCallback((newMonth: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newMonth) {
        next.set('m', newMonth);
      } else {
        next.delete('m');
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const members = useMemo(() => {
    return getMembersForMonth(selectedMonth);
  }, [selectedMonth]);

  const getLinkWithMonth = useCallback((path: string) => {
    if (!selectedMonth) return path;
    const hasQuery = path.includes('?');
    return `${path}${hasQuery ? '&' : '?'}m=${encodeURIComponent(selectedMonth)}`;
  }, [selectedMonth]);

  return {
    selectedMonth,
    availableMonths: AVAILABLE_MONTHS,
    setMonth,
    members,
    getLinkWithMonth,
  };
}
