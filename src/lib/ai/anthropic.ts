import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, buildDocPrompt, ProjectInputPayload } from "./prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function generateDocumentContent(
  docType: "PRD" | "AGENTS" | "ARCHITECTURE" | "TODO" | "SKILL" | "WORKFLOW",
  input: ProjectInputPayload
): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 3500,
    system: buildSystemPrompt(),
    messages: [
      {
        role: "user",
        content: buildDocPrompt(docType, input),
      },
    ],
  });

  const firstBlock = response.content[0];
  return firstBlock && firstBlock.type === "text" ? firstBlock.text : "";
}
