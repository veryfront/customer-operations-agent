import { ragStore } from "veryfront/embedding";

export const store = ragStore({
  storagePath: "data/knowledge-index.json",
  contentDir: "knowledge",
});
