import {
  ensurePostMethod,
  generateChatReply,
  parseRequestBody,
  sendJson,
} from "./_lib/sidequests.js";

export default async function handler(request, response) {
  if (!ensurePostMethod(request, response)) {
    return;
  }

  const data = parseRequestBody(request);
  const result = await generateChatReply(data);
  sendJson(response, result.status, result.payload);
}
