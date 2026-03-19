// AI model definitions for the chat module
export const DEFAULT_CHAT_MODEL = "mistral-large-latest";

export type ChatModel = {
    id: string;
    name: string;
    provider: string;
    description: string;
};

export const chatModels: ChatModel[] = [
    {
        id: "mistral-large-latest",
        name: "Mistral Large",
        provider: "mistral",
        description: "Most capable Mistral model",
    },
    {
        id: "mistral-small-latest",
        name: "Mistral Small",
        provider: "mistral",
        description: "Fast and cost-effective",
    },
    {
        id: "open-mistral-nemo",
        name: "Mistral Nemo",
        provider: "mistral",
        description: "Lightweight and efficient",
    },
    {
        id: "codestral-latest",
        name: "Codestral",
        provider: "mistral",
        description: "Optimized for code tasks",
    },
];

// Group models by provider for UI
export const modelsByProvider = chatModels.reduce(
    (acc, model) => {
        const provider = model.provider;
        if (!acc[provider]) {
            acc[provider] = [];
        }
        acc[provider]!.push(model);
        return acc;
    },
    {} as Record<string, ChatModel[]>,
);
