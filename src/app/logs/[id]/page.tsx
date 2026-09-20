import { redirect } from "next/navigation";

// Legacy route: the certificate view at /result/[id] is the single record detail page.
export default async function RecordDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/result/${id}`);
}
