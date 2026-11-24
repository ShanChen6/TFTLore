import { getSetIndex } from "@/lib/data";
import { getBuilderData } from "@/lib/builder-data";

// Sinh sẵn file JSON tĩnh cho từng mùa lúc build: /api/builder/<id>
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getSetIndex().map((s) => ({ setId: s.id }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params;
  const data = getBuilderData(setId);
  if (!data) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(data);
}
