import type { Database } from "@/integrations/supabase/types";

export type ServiceType = Database["public"]["Enums"]["enquiry_service"];
export type QuotationStatus = Database["public"]["Enums"]["quotation_status"];
export type BookingStatus = Database["public"]["Enums"]["booking_status"];
export type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];
export type PaymentMethod = Database["public"]["Enums"]["payment_method"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];

export const SERVICE_LABELS: Record<ServiceType, string> = {
  flight: "Flight",
  hotel: "Hotel",
  visa: "Visa",
  holiday: "Holiday Package",
  bus: "Bus",
  vehicle: "Vehicle Rental",
};

export const QUOTATION_STATUS: Record<QuotationStatus, string> = {
  draft: "Draft", sent: "Sent", accepted: "Accepted",
  rejected: "Rejected", expired: "Expired", cancelled: "Cancelled",
};
export const BOOKING_STATUS: Record<BookingStatus, string> = {
  pending: "Pending", confirmed: "Confirmed", issued: "Issued",
  completed: "Completed", cancelled: "Cancelled",
};
export const INVOICE_STATUS: Record<InvoiceStatus, string> = {
  draft: "Draft", pending: "Pending", paid: "Paid", cancelled: "Cancelled",
};
export const PAYMENT_METHOD: Record<PaymentMethod, string> = {
  cash: "Cash", upi: "UPI", bank_transfer: "Bank Transfer", card: "Card", other: "Other",
};
export const PAYMENT_STATUS: Record<PaymentStatus, string> = {
  pending: "Pending", partial: "Partial", paid: "Paid", refunded: "Refunded",
};

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  sent: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  accepted: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  confirmed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  issued: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  completed: "bg-green-600/10 text-green-700 dark:text-green-400 border-green-600/20",
  paid: "bg-green-600/10 text-green-700 dark:text-green-400 border-green-600/20",
  partial: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  rejected: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  expired: "bg-muted text-muted-foreground border-border",
  refunded: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

export const statusTone = (s: string) =>
  STATUS_TONE[s] ?? "bg-muted text-muted-foreground border-border";

export const formatMoney = (n: number | string | null | undefined, currency = "INR") => {
  const v = typeof n === "string" ? parseFloat(n) : n ?? 0;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(v || 0);
};

export type LineItem = {
  id?: string;
  service_type: ServiceType;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
};

export const computeItemTotal = (i: Pick<LineItem, "quantity" | "unit_price" | "discount">) =>
  Math.max(0, Number((i.quantity * i.unit_price - i.discount).toFixed(2)));

export const computeTotals = (items: LineItem[], discount = 0, tax = 0) => {
  const subtotal = Number(items.reduce((s, i) => s + computeItemTotal(i), 0).toFixed(2));
  const total = Number(Math.max(0, subtotal - (discount || 0) + (tax || 0)).toFixed(2));
  return { subtotal, total };
};

// ---------- CSV export ----------
const csvCell = (v: unknown): string => {
  if (v == null) return "";
  const s = v instanceof Date ? v.toISOString() : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function exportCsv<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  columns: { key: keyof T & string; label: string }[],
) {
  const header = columns.map((c) => csvCell(c.label)).join(",");
  const body = rows.map((r) => columns.map((c) => csvCell(r[c.key])).join(",")).join("\n");
  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}