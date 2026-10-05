import { handleApi } from "../lib/openrouter.js";

export default function handler(req, res) {
  return handleApi(req, res, "/api/tutor");
}
