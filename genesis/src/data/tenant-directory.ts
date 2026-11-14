/**
 * Tenant directory — lists the demo businesses for the Demo Hub without
 * loading their booking data. A future API equivalent: GET /tenants.
 */
import { INDUSTRY_IDS, type Business, type IndustryId, type Resource, type Service } from "@/domain/types";
import { industrySeeds } from "./seed";

export interface TenantSummary {
  id: IndustryId;
  business: Business;
  serviceCount: number;
  staffCount: number;
  /** A few representative services for previews. */
  featured: Service[];
  /** Team members with photos, for previews. */
  team: Resource[];
}

export function listDemoTenants(): TenantSummary[] {
  return INDUSTRY_IDS.map((id) => {
    const seed = industrySeeds[id];
    return {
      id,
      business: seed.business,
      serviceCount: seed.services.filter((s) => s.active).length,
      staffCount: seed.resources.filter((r) => r.kind === "staff" && r.active).length,
      featured: seed.services.filter((s) => s.active).slice(0, 3),
      team: seed.resources.filter((r) => r.kind === "staff" && r.photo),
    };
  });
}
