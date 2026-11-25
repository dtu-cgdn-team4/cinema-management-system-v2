import { useCallback, useEffect, useState } from 'react';
import { fetchMemberTickets } from '../api/memberTicketListApi';

/**
 * Hook quản lý state danh sách vé thành viên.
 * Hỗ trợ phân trang và lọc theo view (ALL | UPCOMING | HISTORY).
 */
export default function useMemberTickets() {
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({ all: 0, upcoming: 0, history: 0 });
  // Load the maximum page size supported by the API so every ticket can be
  // reached with the list's internal scrollbar.
  const [pagination, setPagination] = useState({ page: 0, size: 100, totalPages: 0, totalElements: 0 });
  const [view, setView] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (page = 0, size = 10, currentView = view) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMemberTickets({ page, size, view: currentView });
      setTickets(data.tickets?.content ?? []);
      setCounts(data.counts ?? { all: 0, upcoming: 0, history: 0 });
      setPagination({
        page: data.tickets?.page ?? page,
        size: data.tickets?.size ?? size,
        totalPages: data.tickets?.totalPages ?? 0,
        totalElements: data.tickets?.totalElements ?? 0,
      });
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Không thể tải danh sách vé. Vui lòng thử lại.');
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, [view]);

  useEffect(() => {
    load(0, 100, view);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const changePage = (newPage) => load(newPage, pagination.size, view);

  const changeView = (newView) => {
    setView(newView);
  };

  return { tickets, counts, pagination, view, isLoading, error, changePage, changeView, reload: () => load(pagination.page, pagination.size, view) };
}

