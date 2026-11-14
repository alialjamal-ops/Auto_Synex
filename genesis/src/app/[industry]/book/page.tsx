import type { Metadata } from "next";
import { BookingPortal } from "@/components/booking/booking-portal";

export const metadata: Metadata = { title: "Booking portal" };

export default function BookPage() {
  return <BookingPortal />;
}
