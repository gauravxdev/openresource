import { mistral } from "@ai-sdk/mistral";

export function getLanguageModel(modelId: string) {
    return mistral(modelId);
}

export function getTitleModel() {
    return mistral("mistral-small-latest");
}
