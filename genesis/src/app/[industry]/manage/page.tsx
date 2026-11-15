import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalFrame } from "@/components/booking/booking-portal";
import { ManageBooking } from "@/components/booking/manage-booking";

export const metadata: Metadata = { title: "Manage booking" };

export default function ManagePage() {
  return (
    <PortalFrame>
      <Suspense>
        <ManageBooking />
      </Suspense>
    </PortalFrame>
  );
}
