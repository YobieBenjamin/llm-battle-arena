// A deliberately rough English-text heuristic, not a model tokenizer or price calculator.
export function estimateTokens(text = '') {
  return text ? Math.ceil(Array.from(text).length / 4) : 0;
}
export function validTokenCount(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}
export function tokenSummary({ prompt = '', text = '', inputTokens, tokens, status } = {}) {
  const input = validTokenCount(inputTokens);
  // During streaming the last usage event may lag behind the visible text.
  const output = ['queued', 'connecting', 'streaming'].includes(status) ? null : validTokenCount(tokens);
  return {
    question: { value: input ?? estimateTokens(prompt), estimated: input === null },
    answer: { value: output ?? estimateTokens(text), estimated: output === null }
  };
}
export function formatTokenCount(count) {
  return `${count.estimated ? '~' : ''}${count.value.toLocaleString('en-US')}`;
}
export function formatTokenSummary(summary) {
  return `Q ${formatTokenCount(summary.question)} · A ${formatTokenCount(summary.answer)} tokens`;
}
