export interface JsonCandidate {
  text: string;
  start: number;
  end: number;
  complete: boolean;
  jsonType: "object" | "array";
}

const OPENERS = new Set(["{", "["]);
const CLOSERS: Record<string, string> = {
  "{": "}",
  "[": "]"
};

export function extractJsonCandidate(text: string): JsonCandidate | null {
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (!OPENERS.has(char)) {
      continue;
    }

    return scanCandidate(text, index);
  }

  return null;
}

function scanCandidate(text: string, start: number): JsonCandidate {
  const first = text[start];
  const stack: string[] = [CLOSERS[first]];
  let inString = false;
  let escaped = false;

  for (let index = start + 1; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{" || char === "[") {
      stack.push(CLOSERS[char]);
      continue;
    }

    if (char === "}" || char === "]") {
      const expected = stack.pop();
      if (char !== expected) {
        return {
          text: text.slice(start, index + 1),
          start,
          end: index + 1,
          complete: true,
          jsonType: first === "{" ? "object" : "array"
        };
      }

      if (stack.length === 0) {
        return {
          text: text.slice(start, index + 1),
          start,
          end: index + 1,
          complete: true,
          jsonType: first === "{" ? "object" : "array"
        };
      }
    }
  }

  return {
    text: text.slice(start),
    start,
    end: text.length,
    complete: false,
    jsonType: first === "{" ? "object" : "array"
  };
}
