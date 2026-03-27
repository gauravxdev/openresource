import { mistral } from "@ai-sdk/mistral";

export function getLanguageModel(modelId: string) {
  return mistral(modelId);
}

export function getTitleModel() {
  return mistral("mistral-small-latest");
}

export function getAdminModel() {
  return mistral("mistral-large-2512");
}
