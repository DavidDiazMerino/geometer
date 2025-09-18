const MAX_INPUT_LENGTH = 8000;

function clipText(input) {
  const text = typeof input === "string" ? input : String(input ?? "");
  if (text.length <= MAX_INPUT_LENGTH) {
    return text;
  }
  return text.slice(0, MAX_INPUT_LENGTH);
}

function getWindow() {
  return typeof window === "undefined" ? undefined : window;
}

export function hasBuiltInAI() {
  const win = getWindow();
  return !!win?.ai;
}

export async function summarizeText(text, mode = "key-points") {
  const win = getWindow();
  if (!win?.ai?.summarizer?.create) {
    return null;
  }
  const summaryMode = mode === "tl;dr" ? "tl;dr" : "key-points";
  try {
    const summarizer = await win.ai.summarizer.create({ type: summaryMode });
    if (!summarizer?.summarize) {
      return null;
    }
    const result = await summarizer.summarize(clipText(text));
    if (typeof result === "string") {
      return result;
    }
    if (result && typeof result.summary === "string") {
      return result.summary;
    }
  } catch (error) {
    console.error("[ai.js] summarizeText failed", error);
  }
  return null;
}

export async function promptLLM(prompt) {
  const win = getWindow();
  if (!win?.ai?.languageModel?.create) {
    return null;
  }
  try {
    const model = await win.ai.languageModel.create();
    if (!model?.prompt) {
      return null;
    }
    const response = await model.prompt(clipText(prompt));
    if (typeof response === "string") {
      return response;
    }
    if (response && typeof response === "object") {
      if (typeof response.output === "string") {
        return response.output;
      }
      if (typeof response.result === "string") {
        return response.result;
      }
      if (typeof response.text === "string") {
        return response.text;
      }
    }
  } catch (error) {
    console.error("[ai.js] promptLLM failed", error);
  }
  return null;
}

function pickExampleStrings(source) {
  const examples = [];
  if (!Array.isArray(source)) {
    return examples;
  }
  for (const item of source) {
    if (examples.length >= 3) {
      break;
    }
    if (typeof item === "string" && item.trim()) {
      examples.push(item.trim());
      continue;
    }
    if (item && typeof item === "object") {
      const parts = [];
      const candidateKeys = [
        "example",
        "explanation",
        "suggestion",
        "message",
        "description",
        "replacement"
      ];
      for (const key of candidateKeys) {
        const value = item[key];
        if (typeof value === "string" && value.trim()) {
          parts.push(value.trim());
        }
      }
      if (parts.length) {
        examples.push(parts.join(" — "));
        continue;
      }
    }
    try {
      const serialized = JSON.stringify(item);
      if (serialized && serialized !== "{}") {
        examples.push(serialized);
      }
    } catch (error) {
      console.error("[ai.js] Failed to serialize proofread example", error);
    }
  }
  return examples;
}

export async function proofread(text) {
  const win = getWindow();
  if (!win?.ai?.proofreader?.create) {
    return null;
  }
  try {
    const proofreader = await win.ai.proofreader.create();
    if (!proofreader?.proofread) {
      return null;
    }
    const result = await proofreader.proofread(clipText(text));
    if (!result) {
      return null;
    }
    if (typeof result.count === "number" && Array.isArray(result.examples)) {
      return {
        count: result.count,
        examples: pickExampleStrings(result.examples)
      };
    }
    const issues = Array.isArray(result.issues)
      ? result.issues
      : Array.isArray(result.corrections)
      ? result.corrections
      : Array.isArray(result.edits)
      ? result.edits
      : [];
    const examples = pickExampleStrings(
      Array.isArray(result.examples) ? result.examples : issues
    );
    const count =
      typeof result.count === "number"
        ? result.count
        : Array.isArray(issues)
        ? issues.length
        : Array.isArray(result.examples)
        ? result.examples.length
        : 0;
    return {
      count,
      examples
    };
  } catch (error) {
    console.error("[ai.js] proofread failed", error);
    return null;
  }
}

export async function rewrite(text, instruction) {
  const win = getWindow();
  if (!win?.ai?.writer?.create) {
    return null;
  }
  try {
    const writer = await win.ai.writer.create();
    if (!writer?.rewrite) {
      return null;
    }
    const response = await writer.rewrite({
      text: clipText(text),
      instruction: typeof instruction === "string" ? instruction : String(instruction ?? "")
    });
    if (typeof response === "string") {
      return response;
    }
    if (response && typeof response === "object") {
      if (typeof response.text === "string") {
        return response.text;
      }
      if (typeof response.result === "string") {
        return response.result;
      }
      if (typeof response.output === "string") {
        return response.output;
      }
    }
  } catch (error) {
    console.error("[ai.js] rewrite failed", error);
  }
  return null;
}
