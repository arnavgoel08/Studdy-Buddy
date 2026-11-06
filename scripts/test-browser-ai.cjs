'use strict';
const fs=require('fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('path');
const raw=fs.readFileSync(path.join(__dirname,'..','browser-ai.js'),'utf8');
assert(raw.includes('web-llm@0.2.82'));
assert(!raw.includes('sample.json'));
assert(!raw.includes('your helpful response'));
const js=raw.replace("await import('https://esm.run/@mlc-ai/web-llm@0.2.82')",'await globalThis.__testWebLLM()');
function ctxFor(fake) {
  const loaded=[];
  const c={window:{__SB_BROWSER_AI:true,isSecureContext:true},navigator:{gpu:{requestAdapter:async()=>({})}},
    document:{readyState:'loading',addEventListener(){}},
    __testWebLLM:async()=>({CreateMLCEngine:async id=>{loaded.push(id);return fake;}}),console};
  vm.runInNewContext(js,c);
  return {c,loaded};
}
function mkEngine(cb) {return {chat:{completions:{create:cb}}};}
(async()=>{
  const calls=[];
  const engine=mkEngine(async opts=>{
    calls.push(opts);
    if(opts.stream) throw Error('mock streaming unavailable');
    return {choices:[{message:{content:'Hello! What subject are you working on?'}}]};
  });
  const {c,loaded}=ctxFor(engine);
  await c.window.SBBrowserAI.load();
  assert.equal(loaded[0],'SmolLM2-360M-Instruct-q4f32_1-MLC');
  const ai=await c.window.claude.use('sample');
  const result=await ai('hello');
  assert.equal(result.text,'Hello! What subject are you working on?');
  assert.equal(calls.length,2,'streaming failure should retry once in non-streaming mode');
  assert.equal(calls[0].stream,true);
  assert.equal(calls[1].stream,false);
  console.log('PASS optional tutor falls back from streaming to a normal completion');

  let requests=0;
  const {c:g}=ctxFor(mkEngine(async()=>{requests++;throw Error('Object has already been disposed DXGI_ERROR_DEVICE_HUNG');}));
  await g.window.SBBrowserAI.load();
  const badAi=await g.window.claude.use('sample');
  await assert.rejects(badAi('hello'),e=>e.code==='browser_ai_device_lost');
  assert.equal(requests,1);
  assert.equal(g.window.SBBrowserAI.getState().gpuFailed,true);
  await assert.rejects(g.window.SBBrowserAI.load(),e=>e.code==='browser_ai_device_lost');
  console.log('PASS GPU device loss stops retries');
})().catch(e=>{console.error(e);process.exitCode=1;});
