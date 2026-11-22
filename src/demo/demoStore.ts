import {useSyncExternalStore} from 'react';
import {initialState,users} from './seedData';
import type {DemoState} from './types';
const KEY='opspilot-demo-v1';
const object=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const nullableNumber=(x:unknown)=>x===null||typeof x==='number';
const eventValid=(e:unknown)=>object(e)&&typeof e.id==='number'&&typeof e.at==='string'&&Number.isFinite(Date.parse(e.at))&&typeof e.actor==='string'&&typeof e.message==='string';
function valid(x:unknown):x is DemoState {
 if(!object(x)||x.version!==1||typeof x.userId!=='number'||!users.some(u=>u.id===x.userId)||typeof x.clock!=='string'||!Number.isFinite(Date.parse(x.clock))||!Array.isArray(x.requests)||!Array.isArray(x.projects))return false;
 if(x.guide!==undefined&&!['incident','purchase','project'].includes(String(x.guide)))return false;
 return x.requests.every(r=>object(r)&&typeof r.id==='number'&&typeof r.human_readable_id==='string'&&typeof r.title==='string'&&typeof r.description==='string'&&['IT Incident','Purchase Request','Cross-Department Project'].includes(String(r.request_type))&&['Low','Normal','High','Critical'].includes(String(r.priority))&&['Submitted','Needs Information','Triaged','In Progress','Resolved','Closed','Cancelled'].includes(String(r.status))&&typeof r.requester_id==='number'&&nullableNumber(r.assigned_department_id)&&nullableNumber(r.assigned_user_id)&&typeof r.created_at==='string'&&Number.isFinite(Date.parse(r.created_at))&&Array.isArray(r.events)&&r.events.every(eventValid)&&(r.approvals===undefined||(Array.isArray(r.approvals)&&r.approvals.every(a=>object(a)&&typeof a.id==='number'&&typeof a.stage==='string'&&typeof a.role==='string'&&['Pending','Approved','Rejected','Invalidated'].includes(String(a.status)))))&&(r.analysis===undefined||(object(r.analysis)&&object(r.analysis.structured_result)&&typeof r.analysis.structured_result.request_type==='string'&&typeof r.analysis.structured_result.suggested_priority==='string'&&typeof r.analysis.structured_result.suggested_department==='string'&&Array.isArray(r.analysis.structured_result.missing_information)&&object(r.analysis.structured_result.extracted_details))))&&x.projects.every(p=>object(p)&&typeof p.id==='number'&&typeof p.title==='string'&&typeof p.owner_id==='number'&&['Active','Completed'].includes(String(p.status))&&Array.isArray(p.events)&&p.events.every(eventValid)&&Array.isArray(p.tasks)&&p.tasks.every(t=>object(t)&&typeof t.id==='string'&&typeof t.title==='string'&&typeof t.department_id==='number'&&nullableNumber(t.assigned_user_id)&&['Blocked','Ready','In Progress','Completed'].includes(String(t.status))&&Array.isArray(t.dependencies)&&t.dependencies.every(d=>typeof d==='string')&&typeof t.required==='boolean'));
}
function load():DemoState {try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(valid(x))return x;}catch{}return initialState();}
let state=load();const listeners=new Set<()=>void>();
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{throw Error('Browser storage is unavailable; changes could not be saved.');}listeners.forEach(f=>f());}
export function getState(){return state;}
export function update(fn:(draft:DemoState)=>void){const draft=structuredClone(state);fn(draft);const old=state;state=draft;try{save();}catch(e){state=old;throw e;}}
export function reset(){const old=state;state=initialState();try{save();}catch(e){state=old;throw e;}}
export function useDemo(){return useSyncExternalStore(cb=>{listeners.add(cb);return()=>listeners.delete(cb)},getState,getState);}
if(typeof window!=='undefined')window.addEventListener('storage',e=>{if(e.key===KEY){state=load();listeners.forEach(f=>f());}});
