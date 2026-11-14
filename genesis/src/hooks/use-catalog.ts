"use client";

import { useMemo } from "react";
import type { CustomerSummary } from "@/data/repository";
import { useRepoQuery } from "@/data/repository-context";
import type { Resource, Service } from "@/domain/types";

/** Lookup tables for rendering bookings (names, colours) — all via the repository. */
export function useCatalog() {
  const services = useRepoQuery((r) => r.listServices({ includeInactive: true }), []);
  const resources = useRepoQuery((r) => r.listResources({ includeInactive: true }), []);
  const customers = useRepoQuery((r) => r.listCustomers(), []);
  return useMemo(() => {
    const serviceMap = new Map<string, Service>((services.data ?? []).map((s) => [s.id, s]));
    const resourceMap = new Map<string, Resource>((resources.data ?? []).map((r) => [r.id, r]));
    const customerMap = new Map<string, CustomerSummary>((customers.data ?? []).map((c) => [c.id, c]));
    return {
      ready: !!(services.data && resources.data && customers.data),
      services: services.data ?? [],
      staff: (resources.data ?? []).filter((r) => r.kind === "staff"),
      resources: resources.data ?? [],
      customers: customers.data ?? [],
      service: (id: string) => serviceMap.get(id),
      resource: (id: string) => resourceMap.get(id),
      customer: (id: string) => customerMap.get(id),
    };
  }, [services.data, resources.data, customers.data]);
}

export type Catalog = ReturnType<typeof useCatalog>;
