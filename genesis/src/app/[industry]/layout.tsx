import { notFound } from "next/navigation";
import { RepositoryProvider } from "@/data/repository-context";
import { INDUSTRY_IDS, isIndustryId } from "@/domain/types";

export function generateStaticParams() {
  return INDUSTRY_IDS.map((industry) => ({ industry }));
}

export const dynamicParams = false;

export default async function IndustryLayout({ children, params }: LayoutProps<"/[industry]">) {
  const { industry } = await params;
  if (!isIndustryId(industry)) notFound();
  return <RepositoryProvider industry={industry}>{children}</RepositoryProvider>;
}
