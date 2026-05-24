import Anthropic from "@anthropic-ai/sdk";

const apiKey =
  process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ??
  process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error(
    "ANTHROPIC_API_KEY must be set. Please add it as a secret.",
  );
}

const clientOptions: ConstructorParameters<typeof Anthropic>[0] = {
  apiKey,
};

if (process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL) {
  clientOptions.baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
}

export const anthropic = new Anthropic(clientOptions);
