import {
  ensurePostMethod,
  generateTasks,
  parseRequestBody,
  sendJson,
} from "./_lib/sidequests.js";

export default async function handler(request, response) {
  if (!ensurePostMethod(request, response)) {
    return;
  }

  const data = parseRequestBody(request);
  const result = await generateTasks(data);
  sendJson(response, 200, result);
}
