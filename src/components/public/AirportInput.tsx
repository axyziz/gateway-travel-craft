import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { searchAirports, type Airport } from "@/lib/airports";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
};

export function AirportInput({ name, required, placeholder, defaultValue = "" }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [results, setResults] = useState<Airport[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(searchAirports(value));
    setActive(0);
  }, [value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(a: Airport) {
    setValue(`${a.city} (${a.iata}) — ${a.name}`);
    setOpen(false);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => (i + 1) % results.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => (i - 1 + results.length) % results.length); }
    else if (e.key === "Enter") { e.preventDefault(); pick(results[active]); }
    else if (e.key === "Escape") setOpen(false);
  }

  return (
    <div className="relative" ref={wrapRef}>
      <Input
        name={name}
        required={required}
        placeholder={placeholder ?? "City, airport or IATA"}
        value={value}
        onChange={(e) => { setValue(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {open && results.length > 0 && (
        <div className="absolute z-30 mt-1.5 w-full rounded-xl border border-border/70 bg-popover shadow-elegant overflow-hidden">
          <ul role="listbox" className="max-h-72 overflow-auto py-1">
            {results.map((a, i) => (
              <li
                key={a.iata + a.name}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => { e.preventDefault(); pick(a); }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 cursor-pointer text-sm",
                  i === active && "bg-accent",
                )}
              >
                <span className="grid place-items-center w-12 shrink-0 py-1 rounded-md bg-gradient-primary text-primary-foreground text-[11px] font-semibold tracking-wider">
                  {a.iata}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{a.city}, {a.country}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.name}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}