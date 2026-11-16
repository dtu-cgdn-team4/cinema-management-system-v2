import { Client } from '@stomp/stompjs';
import { API_BASE_URL } from './apiClient';

// http://localhost:8080/api/v1 -> ws://localhost:8080/api/v1/showtimes/ws (WebSocketConfig.ENDPOINT ở backend);
// base tương đối /api/v1 (bản build) thì lấy host của trang, https -> wss
const WS_URL = new URL(`${API_BASE_URL}/showtimes/ws`, window.location.href).href.replace(/^http/, 'ws');

/**
 * Đăng ký một kênh STOMP của backend, tự kết nối lại khi rớt mạng.
 * onReconnect chạy mỗi lần kết nối lại (không chạy lần đầu) để trang tải lại dữ liệu có thể đã lỡ.
 * Trả về hàm hủy đăng ký, dùng làm cleanup của useEffect.
 */
export function subscribe(destination, onMessage, { onReconnect } = {}) {
  let connectedBefore = false;
  const client = new Client({
    brokerURL: WS_URL,
    reconnectDelay: 3000,
    onConnect: () => {
      client.subscribe(destination, (frame) => onMessage(JSON.parse(frame.body)));
      if (connectedBefore) onReconnect?.();
      connectedBefore = true;
    },
  });
  client.activate();
  return () => client.deactivate();
}
