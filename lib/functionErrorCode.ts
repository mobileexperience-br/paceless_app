interface JsonBody {
  json: () => Promise<unknown>;
}

interface CloneableBody extends JsonBody {
  clone: () => JsonBody;
}

function hasJsonBody(value: object): value is JsonBody {
  return 'json' in value && typeof value.json === 'function';
}

function isCloneableBody(value: JsonBody): value is CloneableBody {
  return 'clone' in value && typeof value.clone === 'function';
}

async function readJson(body: JsonBody): Promise<unknown> {
  try {
    const source = isCloneableBody(body) ? body.clone() : body;
    return await source.json();
  } catch {
    return null;
  }
}

function errorFieldOf(body: unknown): string | null {
  if (typeof body !== 'object' || body === null || !('error' in body)) return null;
  return typeof body.error === 'string' ? body.error : null;
}

export async function errorCodeOf(error: unknown): Promise<string | null> {
  if (typeof error !== 'object' || error === null || !('context' in error)) return null;
  const { context } = error;
  if (typeof context !== 'object' || context === null || !hasJsonBody(context)) return null;
  return errorFieldOf(await readJson(context));
}
