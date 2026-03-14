import { config } from "dotenv";
config();
import { tavilySearch } from "./src/lib/chat/tools";
async function testTavily() {
    console.log("Executing strict test with string query...");
    const res1 = await tavilySearch.execute({ query: "Test AAPL stock price" }, { toolCallId: "1", messages: [] });
    console.log("Res 1:", res1);
    console.log("Executing loose test with object query...");
    const res2 = await tavilySearch.execute({ query: { query: "Test AAPL stock price" } }, { toolCallId: "2", messages: [] });
    console.log("Res 2:", res2);
}
testTavily().catch(console.error);
