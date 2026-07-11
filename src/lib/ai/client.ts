import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import type { z } from 'zod';
import { env, capabilities } from '@/lib/env';

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!capabilities.anthropic) {
    throw new AiConfigError('ANTHROPIC_API_KEY is not configured.');
  }
  if (!_client) {
    _client = new Anthropic({ apiKey: env.anthropic.apiKey });
  }
  return _client;
}

export class AiConfigError extends Error {}
export class AiValidationError extends Error {}
export class AiUpstreamError extends Error {}

export type VisionImage = {
  mediaType: 'image/png' | 'image/jpeg' | 'image/webp';
  dataBase64: string;
};

type RunOptions<T> = {
  system: string;
  user: string;
  schema: z.ZodType<T>;
  images?: VisionImage[];
  maxTokens?: number;
  temperature?: number;
};

/**
 * Calls the configured Claude model and returns a Zod-validated object.
 * On malformed output it attempts safe JSON extraction, then a single
 * corrective retry, then throws. Malformed output is never returned.
 */
export async function runStructured<T>(opts: RunOptions<T>): Promise<{
  data: T;
  model: string;
  usage: { inputTokens: number; outputTokens: number };
}> {
  const client = getClient();
  const model = env.anthropic.model;

  const content: Anthropic.MessageParam['content'] = [];
  if (opts.images?.length) {
    for (const img of opts.images) {
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: img.mediaType, data: img.dataBase64 },
      });
    }
  }
  content.push({ type: 'text', text: opts.user });

  const baseParams: Anthropic.MessageCreateParamsNonStreaming = {
    model,
    max_tokens: opts.maxTokens ?? 4096,
    temperature: opts.temperature ?? 0.6,
    system: opts.system,
    messages: [{ role: 'user', content }],
  };

  let lastText = '';
  let usage = { inputTokens: 0, outputTokens: 0 };

  for (let attempt = 0; attempt < 2; attempt++) {
    let message: Anthropic.Message;
    try {
      const params =
        attempt === 0
          ? baseParams
          : {
              ...baseParams,
              messages: [
                { role: 'user' as const, content },
                { role: 'assistant' as const, content: lastText.slice(0, 6000) },
                {
                  role: 'user' as const,
                  content:
                    'That response was not valid JSON matching the required schema. ' +
                    'Reply again with ONLY a single JSON object, no prose, no markdown fences.',
                },
              ],
            };
      message = await client.messages.create(params);
    } catch (err) {
      throw new AiUpstreamError(
        err instanceof Error ? err.message : 'Upstream model error',
      );
    }

    usage = {
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
    };
    lastText = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n');

    const extracted = extractJson(lastText);
    if (extracted) {
      const parsed = opts.schema.safeParse(extracted);
      if (parsed.success) {
        return { data: parsed.data, model, usage };
      }
    }
  }

  throw new AiValidationError('Model output failed schema validation after retry.');
}

/** Best-effort JSON extraction from a model response. */
export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  // strip markdown fences
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1] : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    // fall back to first {...} balanced span
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}
