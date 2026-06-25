import { store } from "../../../store.ts";

export async function POST(): Promise<Response> {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.VERYFRONT_ALLOW_LOCAL_INGEST !== "1"
  ) {
    return Response.json(
      { error: "Local knowledge ingest is disabled in production." },
      { status: 404 }
    );
  }

  await store.indexContentDir();
  return Response.json({ ok: true });
}
