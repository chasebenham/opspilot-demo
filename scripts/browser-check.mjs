// Optional smoke check against a running static preview and a local CDP browser.
// It never starts or contacts OpsPilot's API.
const pages=await (await fetch('http://127.0.0.1:9234/json')).json();
const page=pages.find(p=>p.type==='page');
if(!page)throw Error('No browser page available');
const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise((ok,fail)=>{ws.onopen=ok;ws.onerror=fail});
let seq=0;const pending=new Map(),requests=[];
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);if(m.id&&pending.has(m.id)){const {ok,fail}=pending.get(m.id);pending.delete(m.id);m.error?fail(Error(m.error.message)):ok(m.result||{})}};
function command(method,params={}){return new Promise((ok,fail)=>{const id=++seq;pending.set(id,{ok,fail});ws.send(JSON.stringify({id,method,params}))})}
async function evaluate(expression){const r=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result?.value}
const pause=()=>new Promise(r=>setTimeout(r,450));
async function click(text,index=0){await evaluate(`(()=>{let x=[...document.querySelectorAll('button,a')].filter(e=>(e.textContent.trim()===${JSON.stringify(text)}||e.getAttribute('aria-label')===${JSON.stringify(text)}))[${index}];if(!x)throw Error('Missing action: '+${JSON.stringify(text)});x.click()})()`);await pause()}
async function choose(label,value){await evaluate(`(()=>{let x=[...document.querySelectorAll('select')].find(e=>e.getAttribute('aria-label')===${JSON.stringify(label)});if(!x)throw Error('Missing selector');x.value=${JSON.stringify(String(value))};x.dispatchEvent(new Event('change',{bubbles:true}))})()`);await pause()}
async function contains(text){return evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`)}
async function assert(value,label){if(!await value)throw Error('Failed: '+label);console.log('PASS',label)}
async function reset(){await evaluate('window.confirm=()=>true');await click('Reset Demo')}
await command('Page.enable');await command('Runtime.enable');await command('Network.enable');
await command('Page.navigate',{url:'http://127.0.0.1:4175/opspilot/#/try'});await new Promise(r=>setTimeout(r,1200));await evaluate('localStorage.clear()');await command('Page.reload');await new Promise(r=>setTimeout(r,1200));
// Direct hash link and reload work on a plain static server.
await command('Page.navigate',{url:'http://127.0.0.1:4175/opspilot/#/requests'});await new Promise(r=>setTimeout(r,1000));
await assert(contains('All requests'),'direct requests link');await command('Page.reload');await new Promise(r=>setTimeout(r,1000));await assert(contains('All requests'),'direct link survives refresh');
await click('Try a demo');
// IT walkthrough.
await click('Show next action',0);await click('Open example');await click('Show illustrative AI analysis');await click('Apply priority suggestion: High');await click('Submit request');
await assert(contains('Automatically routed to IT') .then(v=>v||contains('routed to IT')),'incident submission and routing');await click('Advance 1 hour');await assert(contains('Escalated for attention'),'incident escalation');
// Sequential purchase walkthrough.
await reset();await assert(evaluate("JSON.parse(localStorage.getItem('opspilot-demo-v1')).requests.length===2"),'reset restores seed data');await evaluate('location.hash="#/try"');await pause();await click('Show next action',1);await click('Open approvals');await choose('Select demo user',3);await click('Approve Department Manager');await choose('Select demo user',4);await click('Approve Finance');await assert(contains('Purchase: Authorized'),'purchase authorization');
// Project walkthrough and durable completion.
await reset();await evaluate('location.hash="#/try"');await pause();await click('Show next action',2);await click('Open workflow');await assert(contains('Blocked'),'blocked dependencies visible');await choose('Select demo user',5);
for(const task of ['Marketing brief','Creative design','Compliance review','Landing page development','Quality assurance','Launch authorization']){
 for(const action of ['Start task','Complete task']){await evaluate(`(()=>{let card=[...document.querySelectorAll('article')].find(x=>x.querySelector('h4')?.textContent===${JSON.stringify(task)});let b=[...(card?.querySelectorAll('button')||[])].find(x=>x.textContent.trim()===${JSON.stringify(action)});if(!b)throw Error('Unavailable ${action} for ${task}');b.click()})()`);await pause()}
}
await click('Authorize completion');await assert(contains('6/6 tasks complete'),'workflow completion');await command('Page.reload');await new Promise(r=>setTimeout(r,1000));await assert(contains('6/6 tasks complete'),'state persists after refresh');
const external=requests.filter(u=>!u.startsWith('http://127.0.0.1:4175/')&&!u.startsWith('data:')&&!u.startsWith('blob:'));
console.log('External network requests:',external.length);if(external.length)throw Error('Unexpected external request');
await command('Browser.close');ws.close();
