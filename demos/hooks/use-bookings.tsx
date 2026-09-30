'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type { AppointmentOverride, Booking } from '@/lib/booking';
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

interface Store<T> {
  data: T;
  hydrated: boolean;
  listeners: Set<Listener>;
}

type Overrides = Readonly<Record<string, AppointmentOverride>>;

const EMPTY: Booking[] = [];
const NO_OVERRIDES: Overrides = {};
const stores = new Map<string, Store<unknown>>();

const bookingsKey = (slug: DemoSlug) => `demo-suite:bookings:${slug}`;
const overridesKey = (slug: DemoSlug) => `demo-suite:overrides:${slug}`;

function getStore<T>(key: string, empty: T): Store<T> {
  let store = stores.get(key) as Store<T> | undefined;
  if (!store) {
    store = { data: empty, hydrated: false, listeners: new Set() };
    stores.set(key, store as Store<unknown>);
  }
  return store;
}

function hydrate<T>(key: string, empty: T): Store<T> {
  const store = getStore(key, empty);
  if (store.hydrated || typeof window === 'undefined') return store;
  store.hydrated = true;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) store.data = JSON.parse(raw) as T;
  } catch {
    // Private mode or a corrupted payload — start clean, never crash the demo.
  }
  return store;
}

function commit<T>(key: string, empty: T, next: T): void {
  const store = getStore(key, empty);
  store.data = next;
  try {
    window.localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // Storage unavailable — the demo still works for this session.
  }
  for (const listener of store.listeners) listener();
}

function subscribe<T>(key: string, empty: T) {
  return (listener: Listener) => {
    const store = getStore(key, empty);
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
  /** Dashboard edits (status, follow-up), keyed by appointment id. */
  overrides: Overrides;
  addBooking: (booking: Booking) => void;
  cancelBooking: (id: string) => void;
  /** Merges a dashboard edit into any appointment, seeded or visitor-made. */
  updateAppointment: (id: string, patch: AppointmentOverride) => void;
  clearBookings: () => void;
  /** False during server render and the first hydration pass. */
  ready: boolean;
}

const BookingsContext = createContext<BookingsContextValue | null>(null);

export function BookingsProvider({ slug, children }: { slug: DemoSlug; children: ReactNode }) {
  const bKey = bookingsKey(slug);
  const oKey = overridesKey(slug);

  const bookings = useSyncExternalStore(
    useMemo(() => subscribe(bKey, EMPTY), [bKey]),
    () => hydrate(bKey, EMPTY).data,
    () => EMPTY,
  );

  const overrides = useSyncExternalStore(
    useMemo(() => subscribe(oKey, NO_OVERRIDES), [oKey]),
    () => hydrate(oKey, NO_OVERRIDES).data,
    () => NO_OVERRIDES,
  );

  const ready = useSyncExternalStore(
    useMemo(() => subscribe(bKey, EMPTY), [bKey]),
    () => true,
    () => false,
  );

  const addBooking = useCallback(
    (booking: Booking) => {
      commit(bKey, EMPTY, [...hydrate(bKey, EMPTY).data, booking]);
    },
    [bKey],
  );

  const cancelBooking = useCallback(
    (id: string) => {
      commit(
        bKey,
        EMPTY,
        hydrate(bKey, EMPTY).data.map((booking) =>
          booking.id === id ? { ...booking, status: 'cancelled' as const } : booking,
        ),
      );
    },
    [bKey],
  );

  const updateAppointment = useCallback(
    (id: string, patch: AppointmentOverride) => {
      const current = hydrate(oKey, NO_OVERRIDES).data;
      commit(oKey, NO_OVERRIDES, { ...current, [id]: { ...current[id], ...patch } });
    },
    [oKey],
  );

  const clearBookings = useCallback(() => {
    commit(bKey, EMPTY, []);
    commit(oKey, NO_OVERRIDES, {});
  }, [bKey, oKey]);

  const value = useMemo<BookingsContextValue>(
    () => ({ bookings, overrides, addBooking, cancelBooking, updateAppointment, clearBookings, ready }),
    [bookings, overrides, addBooking, cancelBooking, updateAppointment, clearBookings, ready],
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
