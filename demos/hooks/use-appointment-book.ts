'use client';

import { useMemo } from 'react';
import { useBookings } from '@/hooks/use-bookings';
import {
  buildCustomers,
  generateAppointments,
  summarize,
  visitorToAppointment,
  type Appointment,
  type CustomerRecord,
  type DashboardSummary,
} from '@/lib/dashboard';
import type { DemoConfig } from '@/types/demo';

interface AppointmentBook {
  appointments: Appointment[];
  summary: DashboardSummary;
  customers: CustomerRecord[];
  /** Bookings the visitor created in this demo session. */
  visitor: Appointment[];
  /** False until localStorage has been read. */
  ready: boolean;
}

/**
 * The dashboard's single source of truth.
 *
 * Seeded appointments are regenerated deterministically from `todayIso` (so the
 * server and the browser agree), then merged with whatever the visitor booked
 * during this session.
 */
export function useAppointmentBook(config: DemoConfig, todayIso: string): AppointmentBook {
  const { bookings, ready } = useBookings();

  const seeded = useMemo(() => generateAppointments(config, todayIso), [config, todayIso]);

  const visitor = useMemo(
    () => bookings.map((booking) => visitorToAppointment(booking, config)),
    [bookings, config],
  );

  const appointments = useMemo(
    () =>
      [...seeded, ...visitor].sort((a, b) =>
        a.date === b.date ? (a.time ?? '').localeCompare(b.time ?? '') : a.date.localeCompare(b.date),
      ),
    [seeded, visitor],
  );

  const summary = useMemo(
    () => summarize(appointments, config, todayIso),
    [appointments, config, todayIso],
  );

  const customers = useMemo(
    () => buildCustomers(appointments, config, todayIso),
    [appointments, config, todayIso],
  );

  return { appointments, summary, customers, visitor, ready };
}
