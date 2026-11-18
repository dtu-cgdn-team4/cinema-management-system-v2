import apiClient from '../../../services/apiClient';

/** Rạp đang hoạt động kèm số phòng chiếu, xếp theo thành phố. */
export const getCinemas = () => apiClient.get('/cinemas');
