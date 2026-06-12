export interface ParseJsonSuccess {
  ok: true;
  value: unknown;
}

export interface ParseJsonFailure {
  ok: false;
  error: SyntaxError;
}

export type ParseJsonResult = ParseJsonSuccess | ParseJsonFailure;

export function parseJson(text: string): ParseJsonResult {
  try {
    return {
      ok: true,
      value: JSON.parse(text)
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof SyntaxError ? error : new SyntaxError(String(error))
    };
  }
}
