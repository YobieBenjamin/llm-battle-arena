import {PROVIDERS} from './providers.js';
import {ROUTER_MODELS} from './catalog.js';
export function connectionFields(connections,api) {
  const $=id=>document.getElementById(id),container=$('connection-fields'); container.replaceChildren();
  const route=document.createElement('label'); route.textContent='Connection route '; const routing=document.createElement('select'); routing.id='connection-route';
  for(const [value,label] of [['direct','Direct provider keys'],['openrouter','OpenRouter · one key']]) {const option=new Option(label,value);routing.add(option);}routing.value=connections.route||'direct'; route.append(routing); container.append(route);
  const direct=document.createElement('div'),router=document.createElement('div');container.append(direct,router);
  function fill(select,models,current) {select.replaceChildren(); for(const model of [...new Set([current,...models])].filter(Boolean)) select.add(new Option(model+(models.length&&!models.includes(model)?' (saved; not in returned list)':''),model)); select.value=current;}
  function section(id,name,parent) {
    const section=document.createElement('section');section.className='connection';
    section.innerHTML=`<button type="button" id="${id}-get-key">Get API key ↗</button><strong>${name}</strong><label for="${id}-key">API key</label><input id="${id}-key" type="password" autocomplete="off" spellcheck="false"><label><input id="${id}-remove" type="checkbox"> Remove saved key</label><button type="button" id="${id}-load-models">Check key &amp; load models</button><p id="${id}-check-result" role="status"></p>`;
    parent.append(section);$(`${id}-key`).placeholder=(id==='openrouter'?connections.openrouter?.connected:connections.providers[id].connected)?'Saved · leave blank to keep':'Paste API key';
    $(`${id}-get-key`).onclick=()=>api.open(id,'keys').catch(e=>$(`${id}-check-result`).textContent=e.message);
    return section;
  }
  for(const [id,p] of Object.entries(PROVIDERS)) {
    const el=section(id,p.name,direct);const label=document.createElement('label');label.textContent='Model ';const select=document.createElement('select');select.id=`${id}-config-model`;fill(select,[],connections.providers[id].model);label.append(select);el.append(label);
    $(`${id}-load-models`).onclick=async()=>{const button=$(`${id}-load-models`),status=$(`${id}-check-result`);button.disabled=true;status.textContent='Checking…';try {const models=await api.listModels(id,$(`${id}-key`).value);fill(select,models,select.value);status.textContent=`Key accepted. ${models.length} models listed. Listing does not guarantee generation access or billing credit.`;}catch(e){status.textContent=e.message;}finally{button.disabled=false;}};
  }
  const disclosure=document.createElement('p');disclosure.textContent='OpenRouter receives your prompts and answers and routes them to model hosts. Its billing and privacy policies apply. Choosing this route sends all three cards through OpenRouter.';router.append(disclosure);
  const el=section('openrouter','OpenRouter',router);
  for(const [id,p] of Object.entries(PROVIDERS)) {const label=document.createElement('label');label.textContent=`${p.name} model `;const select=document.createElement('select');select.id=`router-${id}-model`;fill(select,[],connections.openrouter?.models[id]||ROUTER_MODELS[id]);label.append(select);el.append(label);}
  $('openrouter-load-models').onclick=async()=>{const button=$('openrouter-load-models'),status=$('openrouter-check-result');button.disabled=true;status.textContent='Checking…';try {const models=await api.listModels('openrouter',$('openrouter-key').value);for(const id of Object.keys(PROVIDERS)){const select=$(`router-${id}-model`),prefix={claude:'anthropic/',openai:'openai/',gemini:'google/'}[id];fill(select,models.filter(m=>m.startsWith(prefix)),select.value);}status.textContent='Key accepted. Choose a model for each card. Availability and billing still depend on your account.';}catch(e){status.textContent=e.message;}finally{button.disabled=false;}};
  routing.onchange=()=>{direct.hidden=routing.value==='openrouter';router.hidden=!direct.hidden;};routing.onchange();
}
export function readConnections() {
  const $=id=>document.getElementById(id);
  return {...Object.fromEntries(Object.keys(PROVIDERS).map(id=>[id,{key:$(`${id}-key`).value,model:$(`${id}-config-model`).value,remove:$(`${id}-remove`).checked}])),openrouter:{key:$('openrouter-key').value,remove:$('openrouter-remove').checked,enabled:$('connection-route').value==='openrouter',models:Object.fromEntries(Object.keys(PROVIDERS).map(id=>[id,$(`router-${id}-model`).value]))}};
}
