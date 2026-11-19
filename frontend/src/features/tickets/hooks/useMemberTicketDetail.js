import { useCallback, useEffect, useState } from 'react';
import { fetchMemberTicketDetail } from '../api/memberTicketApi';

export default function useMemberTicketDetail(bookingCode, enabled = true) {
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);
  const [isNotFound, setIsNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!enabled || !bookingCode) return;

    setIsLoading(true);
    setError(null);
    setIsNotFound(false);

    try {
      const data = await fetchMemberTicketDetail(bookingCode);
      setTicket(data);
    } catch (requestError) {
      setTicket(null);
      setIsNotFound(requestError?.response?.status === 404);
      setError(
        requestError?.response?.data?.message ??
          'Không thể tải thông tin vé. Vui lòng thử lại.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [bookingCode, enabled]);

  useEffect(() => {
    if (enabled) load();
  }, [enabled, load]);

  return { ticket, isLoading, error, isNotFound, reload: load };
}
