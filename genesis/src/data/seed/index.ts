import type { IndustryId } from "@/domain/types";
import { academySeed } from "./academy";
import { clinicSeed } from "./clinic";
import { salonSeed } from "./salon";
import { studioSeed } from "./studio";
import type { IndustrySeed } from "./types";

export const industrySeeds: Record<IndustryId, IndustrySeed> = {
  clinic: clinicSeed,
  salon: salonSeed,
  academy: academySeed,
  studio: studioSeed,
};

export type { IndustrySeed };
