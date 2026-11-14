import type { Business, Resource, Service } from "@/domain/types";
import type { SeedPerson } from "./helpers";

/** Static configuration of one demo industry. Bookings are generated relative to today. */
export interface IndustrySeed {
  business: Business;
  services: Service[];
  resources: Resource[];
  customers: SeedPerson[];
}
