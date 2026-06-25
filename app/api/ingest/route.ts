import { store } from "../../../store.ts";

export async function POST(): Promise<Response> {
  await store.indexContentDir();
  return Response.json({ ok: true });
}
