import { Suspense } from "react";
import { Appointments } from "@/components/dashboard/appointments";

export default function AppointmentsPage() {
  return (
    <Suspense>
      <Appointments />
    </Suspense>
  );
}
