import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDeleteHandler } from '../supabase/functions/delete-account/handler.ts';

test('deletion verifies JWT and ignores supplied account IDs', async () => {
  const calls=[];
  const handle=createDeleteHandler({authenticate:async token=>token==='valid'?'owner':null,revoke:async token=>{calls.push(['revoke',token]);},remove:async id=>{calls.push(['remove',id]);}});
  assert.equal((await handle(new Request('https://local',{method:'POST'}))).status,401);
  assert.equal((await handle(new Request('https://local',{method:'POST',headers:{Authorization:'Bearer forged'}}))).status,401);
  assert.equal(calls.length,0);
  assert.equal((await handle(new Request('https://local',{headers:{Authorization:'Bearer valid'}}))).status,405);
  const result=await handle(new Request('https://local',{method:'POST',headers:{Authorization:'Bearer valid'},body:JSON.stringify({user_id:'victim'})}));
  assert.equal(result.status,200);
  assert.deepEqual(calls,[['revoke','valid'],['remove','owner']]);
});
test('revocation failure prevents deletion and returns no secret details',async()=>{
  let removed=false;
  const handle=createDeleteHandler({authenticate:async()=> 'owner',revoke:async()=>{throw new Error('private server data');},remove:async()=>{removed=true;}});
  const result=await handle(new Request('https://local',{method:'POST',headers:{Authorization:'Bearer valid'}}));
  assert.equal(result.status,500); assert.equal(removed,false); assert.doesNotMatch(await result.text(),/private server data/);
});
