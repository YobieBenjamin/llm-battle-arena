import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateTokens, tokenSummary, formatTokenSummary } from '../src/tokens.js';
test('estimates label empty, English, and Unicode text without claiming tokenizer accuracy', () => {
  assert.equal(estimateTokens(''), 0);
  assert.equal(estimateTokens('abcdefgh'), 2);
  assert.equal(estimateTokens('🌱🌱🌱🌱'), 1);
  assert.equal(formatTokenSummary(tokenSummary({prompt:'abcdefgh',text:'abcd'})), 'Q ~2 · A ~1 · R — tokens');
});
test('question and reasoning counts preserve zero; visible answers remain estimated', () => {
  const summary=tokenSummary({prompt:'hello',text:'world',inputTokens:0,tokens:20,reasoningTokens:15,status:'done'});
  assert.equal(formatTokenSummary(summary),'Q 0 · A ~2 · R 15 tokens');
  assert.equal(summary.answer.estimated,true);
});
test('streaming output stays estimated until terminal usage is available',()=>{
  const result=tokenSummary({prompt:'abcd',text:'abcdefgh',tokens:1,inputTokens:5,status:'streaming'});
  assert.equal(formatTokenSummary(result),'Q 5 · A ~2 · R — tokens');
});
test('invalid provider counters fall back to clearly marked estimates',()=>{
  for(const value of [-1,Infinity,NaN,'123',null,undefined]) {
    const result=tokenSummary({prompt:'abcd',text:'abcdefgh',inputTokens:value,tokens:value,status:'done'});
    assert.equal(formatTokenSummary(result),'Q ~1 · A ~2 · R — tokens');
  }
});
test('the same visible answer uses the same estimate across incompatible provider usage totals',()=>{
 const openai=tokenSummary({prompt:'hello',text:'Visible answer',tokens:300,reasoningTokens:250});
 const gemini=tokenSummary({prompt:'hello',text:'Visible answer',tokens:40,reasoningTokens:500});
 assert.deepEqual(openai.answer,gemini.answer);
 assert.equal(openai.reasoning.value,250);assert.equal(gemini.reasoning.value,500);
 assert.equal(openai.providerOutput.value,300);assert.equal(gemini.providerOutput.value,40);
});
