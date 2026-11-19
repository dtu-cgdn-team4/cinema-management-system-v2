import { CreditCard, Mail, Smartphone, WalletCards } from 'lucide-react';
import { formatVnd } from '@/utils/format';

const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';

function asVietnamDate(value) {
  if (!value) return null;
  const hasTimeZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  return new Date(hasTimeZone ? value : `${value}+07:00`);
}

function formatDateTime(value) {
  const date = asVietnamDate(value);
  if (!date || Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: VIETNAM_TIME_ZONE,
  }).format(date);
}

function paymentMethodLabel(method) {
  const labels = {
    PAYPAL: 'Ví PayPal',
    THE: 'Thẻ',
  };
  return labels[method] || method || 'Phương thức chưa cập nhật';
}

function formatAmount(amount) {
  return amount == null ? '—' : formatVnd(amount);
}

export default function PaymentDetailsCard({ ticket }) {
  const seats = ticket.seats ?? [];
  const payments = ticket.payments ?? [];
  const recipient = ticket.recipient ?? {};
  const seatLabels = seats
    .map(({ rowName, number }) => `${rowName ?? ''}${number ?? ''}`)
    .filter(Boolean);
  const latestPayment = payments.at(-1);
  const latestPaymentTime = formatDateTime(latestPayment?.occurredAt || ticket.paidAt);
  const hasRecipient = recipient.email || recipient.phoneNumber;

  return (
    <section className="mt-6 rounded-2xl border border-[#252d3b] bg-[#171a23] p-5 shadow-xl sm:p-6">
      <header className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-bold text-white sm:text-lg">Chi Tiết Thanh Toán</h2>
        {(latestPayment || ticket.paidAt) && (
          <span className="inline-flex max-w-full items-center gap-2 self-start rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 sm:self-auto sm:text-xs">
            {latestPayment?.method === 'PAYPAL'
              ? <WalletCards size={13} className="shrink-0" />
              : <CreditCard size={13} className="shrink-0" />}
            <span className="truncate">
              {latestPayment ? paymentMethodLabel(latestPayment.method) : 'Đã thanh toán'}
              {latestPaymentTime ? ` · ${latestPaymentTime}` : ''}
            </span>
          </span>
        )}
      </header>

      <div className="space-y-3 py-4 text-sm">
        <div className="flex items-start justify-between gap-4 text-zinc-400">
          <span className="min-w-0">
            {ticket.seatCount > 0 ? `${ticket.seatCount} × Vé xem phim` : 'Vé xem phim'}
            {seatLabels.length > 0 && ` (${seatLabels.join(', ')})`}
          </span>
          <span className="shrink-0 text-right text-zinc-200">{formatAmount(ticket.subtotal)}</span>
        </div>

        {Number(ticket.discountAmount) > 0 && (
          <div className="flex items-start justify-between gap-4 text-zinc-400">
            <span>Giảm giá</span>
            <span className="shrink-0 text-right text-emerald-300">−{formatAmount(ticket.discountAmount)}</span>
          </div>
        )}

        {payments.length > 0 && (
          <details className="group rounded-lg border border-white/5 bg-black/10 px-3 py-2.5">
            <summary className="cursor-pointer list-none text-xs font-semibold text-zinc-300 marker:hidden">
              <span className="flex items-center justify-between gap-3">
                Chi tiết giao dịch ({payments.length})
                <span className="text-zinc-500 transition group-open:rotate-180">⌄</span>
              </span>
            </summary>
            <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
              {payments.map((payment, index) => (
                <div key={`${payment.transactionCode || payment.occurredAt || payment.method}-${index}`} className="flex items-start justify-between gap-4 text-xs">
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-200">{paymentMethodLabel(payment.method)}</p>
                    <p className="mt-1 break-all text-zinc-500">
                      {[formatDateTime(payment.occurredAt), payment.status, payment.transactionCode]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <span className="shrink-0 text-right text-zinc-300">{formatAmount(payment.amount)}</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-white/10 py-4">
        <span className="text-sm font-bold text-white sm:text-base">Tổng thanh toán:</span>
        <span className="text-xl font-extrabold text-brand sm:text-2xl">{formatAmount(ticket.totalAmount)}</span>
      </div>

      {hasRecipient && (
        <div className="space-y-2 border-t border-white/10 pt-3 text-xs text-zinc-400">
          {recipient.email && (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Mail size={13} className="shrink-0 text-sky-400" />
              <span>Email người nhận:</span>
              <span className="break-all font-medium text-zinc-200">{recipient.email}</span>
            </p>
          )}
          {recipient.phoneNumber && (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Smartphone size={13} className="shrink-0 text-emerald-400" />
              <span>Số điện thoại người nhận:</span>
              <span className="font-medium text-zinc-200">{recipient.phoneNumber}</span>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
