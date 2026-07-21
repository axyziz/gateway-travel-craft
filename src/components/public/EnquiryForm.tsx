import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { submitEnquiry, SERVICE_LABELS, type ServiceType } from "@/lib/enquiries";
import { AirportInput } from "@/components/public/AirportInput";

type Props = { service: ServiceType };

export function EnquiryForm({ service }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ reference: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const get = (k: string) => (fd.get(k) as string | null)?.trim() || null;
    const getNum = (k: string) => {
      const v = fd.get(k);
      return v ? Number(v) : 0;
    };

    if (!get("customer_name")) return toast.error("Please enter your name.");
    if (!get("customer_phone") && !get("customer_email")) {
      return toast.error("Please provide either a phone or email.");
    }

    // Service-specific details
    const details: Record<string, unknown> = {};
    switch (service) {
      case "flight":
        details.origin = get("origin");
        details.destination = get("destination");
        details.trip_type = get("trip_type") ?? "one_way";
        details.departure_date = get("departure_date");
        details.return_date = get("return_date");
        details.cabin = get("cabin");
        details.preferred_airline = get("preferred_airline");
        break;
      case "hotel":
        details.destination = get("destination");
        details.check_in = get("check_in");
        details.check_out = get("check_out");
        details.rooms = getNum("rooms");
        details.guests = getNum("guests");
        details.budget = get("budget");
        break;
      case "visa":
        details.country = get("country");
        details.nationality = get("nationality");
        details.purpose = get("purpose");
        break;
      case "holiday":
        details.destination = get("destination");
        details.budget = get("budget");
        details.days = getNum("days");
        break;
      case "bus":
        details.origin = get("origin");
        details.destination = get("destination");
        details.journey_date = get("journey_date");
        details.passengers = getNum("passengers");
        break;
      case "vehicle":
        details.pickup = get("pickup");
        details.drop = get("drop");
        details.vehicle = get("vehicle");
        details.hours = getNum("hours");
        break;
    }

    setSubmitting(true);
    try {
      const res = await submitEnquiry({
        service_type: service,
        customer_name: get("customer_name")!,
        customer_email: get("customer_email"),
        customer_phone: get("customer_phone"),
        customer_whatsapp: get("customer_whatsapp"),
        travel_date: get("travel_date"),
        adults: getNum("adults") || 1,
        children: getNum("children") || 0,
        infants: getNum("infants") || 0,
        message: get("message"),
        details,
      });
      setSuccess({ reference: res.reference });
      form.reset();
    } catch (err) {
      console.error(err);
      toast.error("Could not submit your enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-8 sm:p-12 border-border/60 shadow-elegant text-center bg-gradient-subtle">
          <div className="mx-auto grid place-items-center h-14 w-14 rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h3 className="mt-6 text-2xl font-semibold tracking-tight">Enquiry received.</h3>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            A Gateway specialist will reach out within one business day. Reference:{" "}
            <span className="font-mono text-foreground">{success.reference}</span>
          </p>
          <div className="mt-6">
            <Button variant="outline" onClick={() => setSuccess(null)}>Submit another enquiry</Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="p-6 sm:p-8 border-border/60 shadow-card">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Enquiry</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight">
          Request a {SERVICE_LABELS[service]} quote
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">We reply within one business day.</p>
      </div>
      <form onSubmit={onSubmit} className="grid gap-5">
        <ServiceFields service={service} />

        <Divider label="Travellers" />
        <div className="grid grid-cols-3 gap-3">
          <Field label="Adults"><Input name="adults" type="number" min={1} defaultValue={1} /></Field>
          <Field label="Children"><Input name="children" type="number" min={0} defaultValue={0} /></Field>
          <Field label="Infants"><Input name="infants" type="number" min={0} defaultValue={0} /></Field>
        </div>

        <Divider label="Your details" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" required><Input name="customer_name" required placeholder="Jane Doe" /></Field>
          <Field label="Email"><Input name="customer_email" type="email" placeholder="you@example.com" /></Field>
          <Field label="Phone"><Input name="customer_phone" type="tel" placeholder="+00 000 000 0000" /></Field>
          <Field label="WhatsApp"><Input name="customer_whatsapp" type="tel" placeholder="Optional" /></Field>
        </div>

        <Field label="Anything else we should know?">
          <Textarea name="message" rows={3} placeholder="Preferences, special requirements, flexibility…" />
        </Field>

        <Button type="submit" size="lg" disabled={submitting} className="bg-gradient-primary text-primary-foreground shadow-soft">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {submitting ? "Submitting…" : "Submit enquiry"}
        </Button>
      </form>
    </Card>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  );
}

function ServiceFields({ service }: { service: ServiceType }) {
  switch (service) {
    case "flight":
      return (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="From" required><AirportInput name="origin" required placeholder="City, airport or IATA" /></Field>
            <Field label="To" required><AirportInput name="destination" required placeholder="City, airport or IATA" /></Field>
          </div>
          <Field label="Trip type">
            <RadioGroup name="trip_type" defaultValue="one_way" className="flex gap-4 pt-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <RadioGroupItem value="one_way" /> One-way
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <RadioGroupItem value="round_trip" /> Round trip
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <RadioGroupItem value="multi_city" /> Multi-city
              </label>
            </RadioGroup>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Departure" required><Input name="departure_date" type="date" required /></Field>
            <Field label="Return"><Input name="return_date" type="date" /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cabin">
              <Select name="cabin" defaultValue="economy">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="premium_economy">Premium Economy</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="first">First</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Preferred airline"><Input name="preferred_airline" placeholder="Optional" /></Field>
          </div>
          <input type="hidden" name="travel_date" />
        </>
      );
    case "hotel":
      return (
        <>
          <Field label="Destination" required><Input name="destination" required placeholder="City" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Check-in" required><Input name="check_in" type="date" required /></Field>
            <Field label="Check-out" required><Input name="check_out" type="date" required /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Rooms"><Input name="rooms" type="number" min={1} defaultValue={1} /></Field>
            <Field label="Guests"><Input name="guests" type="number" min={1} defaultValue={2} /></Field>
            <Field label="Budget / night"><Input name="budget" placeholder="Optional" /></Field>
          </div>
          <input type="hidden" name="travel_date" />
        </>
      );
    case "visa":
      return (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Destination country" required><Input name="country" required placeholder="Country" /></Field>
            <Field label="Nationality" required><Input name="nationality" required placeholder="Passport nationality" /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Purpose of travel">
              <Select name="purpose" defaultValue="tourism">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tourism">Tourism</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="study">Study</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="family">Family visit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Intended travel date"><Input name="travel_date" type="date" /></Field>
          </div>
        </>
      );
    case "holiday":
      return (
        <>
          <Field label="Destination" required><Input name="destination" required placeholder="Where would you like to go?" /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Travel date"><Input name="travel_date" type="date" /></Field>
            <Field label="Days"><Input name="days" type="number" min={1} defaultValue={5} /></Field>
            <Field label="Budget (per person)"><Input name="budget" placeholder="Optional" /></Field>
          </div>
        </>
      );
    case "bus":
      return (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Origin" required><Input name="origin" required /></Field>
            <Field label="Destination" required><Input name="destination" required /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Journey date" required><Input name="journey_date" type="date" required /></Field>
            <Field label="Passengers"><Input name="passengers" type="number" min={1} defaultValue={1} /></Field>
          </div>
          <input type="hidden" name="travel_date" />
        </>
      );
    case "vehicle":
      return (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Pickup" required><Input name="pickup" required placeholder="Pickup location" /></Field>
            <Field label="Drop"><Input name="drop" placeholder="Drop location" /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Vehicle">
              <Select name="vehicle" defaultValue="sedan">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedan">Sedan</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="tempo">Tempo Traveller</SelectItem>
                  <SelectItem value="bus">Mini Bus</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Pickup date" required><Input name="travel_date" type="date" required /></Field>
            <Field label="Hours / Days"><Input name="hours" type="number" min={1} defaultValue={8} /></Field>
          </div>
        </>
      );
  }
}