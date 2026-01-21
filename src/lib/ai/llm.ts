import { generateText } from "ai";
import { mistral } from "@ai-sdk/mistral";

const { text } = await generateText({
    model: mistral("mistral-large-latest"),
    prompt: "who are you?",
});

console.log(text);
