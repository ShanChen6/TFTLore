import { getSet, getSetIndex } from "@/lib/data";
import { buildSetDetails } from "@/lib/set-details";

// JSON tĩnh sinh lúc build: /api/sets/<id>/details
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getSetIndex().map((s) => ({ setId: s.id }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params;
  const set = getSet(setId);
  if (!set) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(buildSetDetails(set));
}
