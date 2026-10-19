export function shuffled(ids,random=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296) {
  const order=[...ids]; for(let i=order.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}return order;
}
export function canVote(comparison,results,pending) {
  return Boolean(comparison?.blind && !comparison.blind.revealed && !pending && comparison.blind.order.every(id=>results[id]?.status==='done' && results[id]?.text));
}
