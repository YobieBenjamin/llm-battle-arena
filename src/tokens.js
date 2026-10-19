// A deliberately rough English-text heuristic, not a model tokenizer or price calculator.
export function estimateTokens(text = '') {
  return text ? Math.ceil(Array.from(text).length / 4) : 0;
}
export function validTokenCount(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}
export function tokenSummary({ prompt = '', text = '', inputTokens, tokens, reasoningTokens } = {}) {
  const input = validTokenCount(inputTokens);
  const reasoning = validTokenCount(reasoningTokens);
  return {
    question: { value: input ?? estimateTokens(prompt), estimated: input === null },
    answer: { value: estimateTokens(text), estimated: true },
    reasoning: { value: reasoning, estimated: false },
    providerOutput: { value: validTokenCount(tokens), estimated: false }
  };
}
export function formatTokenCount(count) {
  return count.value === null ? '—' : `${count.estimated ? '~' : ''}${count.value.toLocaleString('en-US')}`;
}
export function formatTokenSummary(summary) {
  return `Q ${formatTokenCount(summary.question)} · A ${formatTokenCount(summary.answer)} · R ${formatTokenCount(summary.reasoning)} tokens`;
}
