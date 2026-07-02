import { createChatUploadHandler } from "veryfront/chat/uploads";

// POST stores a file, GET streams it back (?id=), DELETE removes it (?id=).
// Local disk in dev, Veryfront Cloud once deployed. Wire `authorize` before
// deploying — the endpoint is open in dev.
export const { POST, GET, DELETE } = createChatUploadHandler();
