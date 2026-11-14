import { z } from "zod";
import type { Dictionary } from "@/i18n/en";

export const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;

export function customerSchema(t: Dictionary) {
  return z.object({
    name: z.string().trim().min(2, t.booking.validation.name).max(80, t.booking.validation.name),
    phone: z.string().trim().regex(PHONE_RE, t.booking.validation.phone),
    email: z.string().trim().email(t.booking.validation.email),
    notes: z.string().max(500).optional(),
  });
}

export function detailsSchema(t: Dictionary, maxSeats: number) {
  return customerSchema(t).extend({
    seats: z.number().int().min(1).max(Math.max(1, maxSeats), t.booking.validation.seats),
    consent: z.literal(true, { error: t.booking.validation.consent }),
  });
}

export type DetailsValues = z.infer<ReturnType<typeof detailsSchema>>;
