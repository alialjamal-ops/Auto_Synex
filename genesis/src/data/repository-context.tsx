"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Business, IndustryId } from "@/domain/types";
import { useFormat, type Formatters } from "@/hooks/use-format";
import { createMemoryStorage, DemoBookingRepository, storageKey } from "./demo-repository";
import type { BookingRepository } from "./repository";

const RepositoryContext = createContext<BookingRepository | null>(null);

/**
 * Wires the UI to a BookingRepository. Swap `DemoBookingRepository` for an
 * `ApiBookingRepository` here to move to the real backend.
 */
export function RepositoryProvider({ industry, children }: { industry: IndustryId; children: ReactNode }) {
  const repo = useMemo(
    () =>
      new DemoBookingRepository(industry, {
        storage: typeof window === "undefined" ? createMemoryStorage() : window.localStorage,
        latencyMs: 160,
      }),
    [industry],
  );

  // Keep several open tabs of the same demo in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey(industry)) repo.invalidate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [industry, repo]);

  return <RepositoryContext.Provider value={repo}>{children}</RepositoryContext.Provider>;
}

export function useRepository(): BookingRepository {
  const repo = useContext(RepositoryContext);
  if (!repo) throw new Error("useRepository must be used inside RepositoryProvider");
  return repo;
}

export interface QueryState<T> {
  data: T | undefined;
  error: unknown;
  /** True while the latest request (initial or refresh) is in flight. */
  loading: boolean;
}

/**
 * Minimal async query hook over the repository. Re-runs when `deps` change or
 * the repository reports a mutation; keeps previous data while refreshing.
 */
export function useRepoQuery<T>(fetcher: (repo: BookingRepository) => Promise<T>, deps: unknown[]): QueryState<T> {
  const repo = useRepository();
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });
  const [version, setVersion] = useState(0);
  useEffect(() => repo.subscribe(() => setVersion((v) => v + 1)), [repo]);

  const key = `${JSON.stringify(deps)}|${version}`;
  const [result, setResult] = useState<{ key: string; data?: T; error?: unknown } | null>(null);

  useEffect(() => {
    let alive = true;
    fetcherRef.current(repo).then(
      (data) => alive && setResult({ key, data }),
      (error: unknown) => alive && setResult((prev) => ({ key, data: prev?.data, error })),
    );
    return () => {
      alive = false;
    };
  }, [repo, key]);

  return {
    data: result?.data,
    error: result?.key === key ? result.error : undefined,
    loading: !result || result.key !== key,
  };
}

interface BusinessValue {
  business: Business;
  fmt: Formatters;
}

const BusinessContext = createContext<BusinessValue | null>(null);

/** Loads the tenant's business profile once; children can assume it exists. */
export function BusinessGate({ fallback, children }: { fallback: ReactNode; children: ReactNode }) {
  const { data } = useRepoQuery((r) => r.getBusiness(), []);
  if (!data) return <>{fallback}</>;
  return <BusinessReady business={data}>{children}</BusinessReady>;
}

function BusinessReady({ business, children }: { business: Business; children: ReactNode }) {
  const fmt = useFormat(business.timezone, business.currency);
  const value = useMemo(() => ({ business, fmt }), [business, fmt]);
  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusiness(): BusinessValue {
  const v = useContext(BusinessContext);
  if (!v) throw new Error("useBusiness must be used inside BusinessGate");
  return v;
}
