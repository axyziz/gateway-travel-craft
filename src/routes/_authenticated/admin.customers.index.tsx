import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/customers/")({
  component: CustomersPage,
});

function CustomersPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "customers", search],
    queryFn: async () => {
      let q = supabase.from("customers").select("*").order("last_enquiry_at", { ascending: false, nullsFirst: false }).limit(200);
      if (search.trim()) {
        const s = `%${search.trim()}%`;
        q = q.or(`name.ilike.${s},email.ilike.${s},phone.ilike.${s}`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <>
      <AdminPageHeader title="Customers" description="Everyone who has ever submitted an enquiry." />
      <Card className="p-4 border-border/60 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, phone…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </Card>
      <Card className="border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Enquiries</TableHead>
              <TableHead>Last enquiry</TableHead>
              <TableHead>Since</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ))
            ) : (data ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={5}>
                <div className="py-12 text-center">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">No customers yet.</p>
                </div>
              </TableCell></TableRow>
            ) : (
              data!.map((c) => (
                <TableRow key={c.id}>
                  <TableCell><Link to="/admin/customers/$id" params={{ id: c.id }} className="font-medium text-sm hover:text-primary">{c.name}</Link></TableCell>
                  <TableCell><p className="text-sm">{c.email ?? "—"}</p><p className="text-xs text-muted-foreground">{c.phone ?? ""}</p></TableCell>
                  <TableCell><Badge variant="secondary">{c.enquiry_count}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.last_enquiry_at ? formatDistanceToNow(new Date(c.last_enquiry_at), { addSuffix: true }) : "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}