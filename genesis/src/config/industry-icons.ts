import { Camera, GraduationCap, Scissors, Stethoscope, type LucideIcon } from "lucide-react";
import type { IndustryId } from "@/domain/types";

export const industryIcons: Record<IndustryId, LucideIcon> = {
  clinic: Stethoscope,
  salon: Scissors,
  academy: GraduationCap,
  studio: Camera,
};
