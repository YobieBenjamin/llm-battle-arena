// Inspect only a small structured error; never return provider text to the UI.
export async function readProviderError(response) {
  if (!response.body) return null;
  const reader=response.body.getReader(), decoder=new TextDecoder();
  let raw='', bytes=0;
  try {
    while (true) {
      const {done,value}=await reader.read();
      if(done) break;
      bytes+=value.byteLength;
      if(bytes>8192) return null;
      raw+=decoder.decode(value,{stream:true});
    }
    return JSON.parse(raw+decoder.decode())?.error || null;
  } catch { return null; }
  finally { await reader.cancel().catch(()=>{}); reader.releaseLock(); }
}
export function invalidGeminiKey(error) {
  return error?.status==='API_KEY_INVALID' || (Array.isArray(error?.details) && error.details.some(detail=>detail?.reason==='API_KEY_INVALID')) || /API key not valid|API_KEY_INVALID/i.test(typeof error?.message==='string'?error.message:'');
}
export function billingError(error) {
  return /credit balance.*(low|insufficient)|insufficient[_ ](credit|fund)|billing|payment.required/i.test(String(error?.type||'')+' '+String(error?.message||''));
}
