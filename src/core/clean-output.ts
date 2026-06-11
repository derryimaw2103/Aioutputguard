import { extractJsonCandidate, type JsonCandidate } from "./extract-json.js";

export type CleaningAction = "removed_markdown_code_block" | "removed_text_outside_json";

export interface CleanOutputResult {
  cleanedText: string;
  cleaned: boolean;
  actions: CleaningAction[];
  candidate: JsonCandidate | null;
}

export function cleanOutput(raw: string): CleanOutputResult {
  const actions: CleaningAction[] = [];
  const withoutMarkdown = replaceMarkdownCodeBlock(raw);

  if (withoutMarkdown !== raw) {
    actions.push("removed_markdown_code_block");
  }

  const candidate = extractJsonCandidate(withoutMarkdown);
  if (!candidate) {
    return {
      cleanedText: withoutMarkdown.trim(),
      cleaned: actions.length > 0,
      actions,
      candidate: null
    };
  }

  const firstContentIndex = findFirstNonWhitespaceIndex(withoutMarkdown);
  const lastContentIndex = findLastNonWhitespaceIndex(withoutMarkdown);
  const removedOutsideJson =
    candidate.start > firstContentIndex || candidate.end - 1 < lastContentIndex;

  if (removedOutsideJson) {
    actions.push("removed_text_outside_json");
  }

  return {
    cleanedText: candidate.text.trim(),
    cleaned: actions.length > 0,
    actions,
    candidate
  };
}

function replaceMarkdownCodeBlock(text: string): string {
  return text.replace(/```(?:json|JSON)?\s*\r?\n?([\s\S]*?)\r?\n?```/g, "$1");
}

function findFirstNonWhitespaceIndex(text: string): number {
  const match = /\S/.exec(text);
  return match?.index ?? 0;
}

function findLastNonWhitespaceIndex(text: string): number {
  for (let index = text.length - 1; index >= 0; index -= 1) {
    if (!/\s/.test(text[index])) {
      return index;
    }
  }
  return 0;
}
