import { redirect } from "next/navigation";

export default async function IndustryIndex({ params }: PageProps<"/[industry]">) {
  const { industry } = await params;
  redirect(`/${industry}/book`);
}
