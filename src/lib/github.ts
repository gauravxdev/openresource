import { Octokit } from 'octokit';
import dotenv from "dotenv";

dotenv.config();

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

async function main() {
    try {
        const { data } = await octokit.rest.users.getAuthenticated();
        console.log(`Authenticated as: ${data.login}`);
    } catch (error) {
        console.error(error);
    }
}

main();

