import { mistral } from "@ai-sdk/mistral";
export function getLanguageModel(modelId) {
    return mistral(modelId);
}
export function getTitleModel() {
    return mistral("mistral-small-latest");
}
