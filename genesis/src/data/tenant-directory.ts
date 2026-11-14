/**
 * Tenant directory — lists the demo businesses for the Demo Hub without
 * loading their booking data. A future API equivalent: GET /tenants.
 */
import { INDUSTRY_IDS, type Business, type IndustryId } from "@/domain/types";
import { industrySeeds } from "./seed";

export interface TenantSummary {
  id: IndustryId;
  business: Business;
  serviceCount: number;
  staffCount: number;
}

export function listDemoTenants(): TenantSummary[] {
  return INDUSTRY_IDS.map((id) => {
    const seed = industrySeeds[id];
    return {
      id,
      business: seed.business,
      serviceCount: seed.services.filter((s) => s.active).length,
      staffCount: seed.resources.filter((r) => r.kind === "staff" && r.active).length,
    };
  });
}
