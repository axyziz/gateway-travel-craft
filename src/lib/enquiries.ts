import { supabase } from "@/integrations/supabase/client";

export type ServiceType = "flight" | "hotel" | "visa" | "holiday" | "bus" | "vehicle";

export const SERVICE_LABELS: Record<ServiceType, string> = {
  flight: "Flight",
  hotel: "Hotel",
  visa: "Visa",
  holiday: "Holiday Package",
  bus: "Bus",
  vehicle: "Vehicle Rental",
};

export const STATUS_LABELS: Record<string, string> = {
  new: "New",
  in_progress: "In Progress",
  quoted: "Quoted",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  in_progress: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  quoted: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  confirmed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  completed: "bg-green-600/10 text-green-700 dark:text-green-400 border-green-600/20",
  cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

export type EnquiryPayload = {
  service_type: ServiceType;
  customer_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  customer_whatsapp?: string | null;
  travel_date?: string | null;
  adults?: number;
  children?: number;
  infants?: number;
  message?: string | null;
  details: Record<string, unknown>;
};

export async function submitEnquiry(payload: EnquiryPayload) {
  // 1. Upsert customer (find by email or phone; else insert)
  let customerId: string | null = null;
  const email = payload.customer_email?.trim().toLowerCase() || null;
  const phone = payload.customer_phone?.trim() || null;

  if (email) {
    const { data } = await supabase.from("customers").select("id").ilike("email", email).limit(1).maybeSingle();
    if (data) customerId = data.id;
  }
  if (!customerId && phone) {
    const { data } = await supabase.from("customers").select("id").eq("phone", phone).limit(1).maybeSingle();
    if (data) customerId = data.id;
  }
  if (!customerId) {
    const { data, error } = await supabase
      .from("customers")
      .insert({
        name: payload.customer_name,
        email,
        phone,
        whatsapp: payload.customer_whatsapp || null,
      })
      .select("id")
      .single();
    if (error) throw error;
    customerId = data.id;
  }

  // 2. Insert enquiry
  const { data: enquiry, error: enqErr } = await supabase
    .from("enquiries")
    .insert({
      customer_id: customerId,
      service_type: payload.service_type,
      customer_name: payload.customer_name,
      customer_email: email,
      customer_phone: phone,
      customer_whatsapp: payload.customer_whatsapp || null,
      travel_date: payload.travel_date || null,
      adults: payload.adults ?? 1,
      children: payload.children ?? 0,
      infants: payload.infants ?? 0,
      message: payload.message || null,
      details: payload.details as never,
    })
    .select("id, reference")
    .single();
  if (enqErr) throw enqErr;
  return enquiry;
}