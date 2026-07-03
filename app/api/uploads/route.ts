import { createChatUploadHandler } from "veryfront/chat/uploads";

// This example app has no auth layer (the AG-UI route is public too), so the
// upload route is deliberately public. Pass `authorize` before deploying this
// anywhere real.
export const { POST, GET, DELETE } = createChatUploadHandler({
  allowUnauthenticated: true,
});
