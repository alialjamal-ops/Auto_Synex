'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type { Booking } from '@/lib/booking';
import type { DemoSlug } from '@/types/demo';

/* ------------------------------------------------------------------ */
/* External store                                                      */
/*                                                                     */
/* localStorage is an external system, so it is wired up through       */
/* useSyncExternalStore rather than an effect. That makes hydration    */
/* safe by construction: the server snapshot is empty, and React swaps */
/* in the stored bookings once it is running in the browser.           */
/* ------------------------------------------------------------------ */

type Listener = () => void;

interface Store {
  data: Booking[];
  hydrated: boolean;
  listeners: Set<Listener>;
}

const EMPTY: Booking[] = [];
const stores = new Map<string, Store>();

const storageKey = (slug: DemoSlug) => `demo-suite:bookings:${slug}`;

function getStore(slug: DemoSlug): Store {
  let store = stores.get(slug);
  if (!store) {
    store = { data: EMPTY, hydrated: false, listeners: new Set() };
    stores.set(slug, store);
  }
  return store;
}

function hydrate(slug: DemoSlug): Store {
  const store = getStore(slug);
  if (store.hydrated || typeof window === 'undefined') return store;
  store.hydrated = true;
  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    if (raw) store.data = JSON.parse(raw) as Booking[];
  } catch {
    // Private mode or a corrupted payload — start clean, never crash the demo.
  }
  return store;
}

function commit(slug: DemoSlug, next: Booking[]): void {
  const store = getStore(slug);
  store.data = next;
  try {
    window.localStorage.setItem(storageKey(slug), JSON.stringify(next));
  } catch {
    // Storage unavailable — the demo still works for this session.
  }
  for (const listener of store.listeners) listener();
}

function subscribe(slug: DemoSlug) {
  return (listener: Listener) => {
    const store = getStore(slug);
    store.listeners.add(listener);
    return () => {
      store.listeners.delete(listener);
    };
  };
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface BookingsContextValue {
  /** Bookings the visitor created during this demo session. */
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  cancelBooking: (id: string) => void;
  clearBookings: () => void;
  /** False during server render and the first hydration pass. */
  ready: boolean;
}

const BookingsContext = createContext<BookingsContextValue | null>(null);

export function BookingsProvider({ slug, children }: { slug: DemoSlug; children: ReactNode }) {
  const bookings = useSyncExternalStore(
    useMemo(() => subscribe(slug), [slug]),
    () => hydrate(slug).data,
    () => EMPTY,
  );

  const ready = useSyncExternalStore(
    useMemo(() => subscribe(slug), [slug]),
    () => true,
    () => false,
  );

  const addBooking = useCallback(
    (booking: Booking) => {
      commit(slug, [...hydrate(slug).data, booking]);
    },
    [slug],
  );

  const cancelBooking = useCallback(
    (id: string) => {
      commit(
        slug,
        hydrate(slug).data.map((booking) =>
          booking.id === id ? { ...booking, status: 'cancelled' as const } : booking,
        ),
      );
    },
    [slug],
  );

  const clearBookings = useCallback(() => commit(slug, []), [slug]);

  const value = useMemo<BookingsContextValue>(
    () => ({ bookings, addBooking, cancelBooking, clearBookings, ready }),
    [bookings, addBooking, cancelBooking, clearBookings, ready],
  );

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export function useBookings(): BookingsContextValue {
  const context = useContext(BookingsContext);
  if (!context) {
    throw new Error('useBookings must be used inside <BookingsProvider>');
  }
  return context;
}
