// Poll from the test driver, rather than leaving a long-lived polling task in
// Chromium while the initial module graph and isolated preload are loading.
module.exports=async function uiReady(page,timeout=60000){
 const end=Date.now()+timeout;
 while(Date.now()<end){
  if(await page.evaluate(()=>Boolean(document.getElementById('claude-answer')&&window.arena&&document.getElementById('mode-note')?.textContent)).catch(()=>false))return;
  await new Promise(resolve=>setTimeout(resolve,100));
 }
 throw new Error(`Application UI did not initialize: ${page.url()}`);
};
