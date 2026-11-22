import type {Approval,Role} from './types';
export function approvalStages(cents:number):Approval[]{if(!Number.isSafeInteger(cents)||cents<=0)throw Error('Enter a valid total USD commitment.');const roles:Role[]=['Department Manager'];if(cents>=100000)roles.push('Finance Approver');if(cents>=500000)roles.push(cents>=2000000?'Executive Approver':'Operations Director');return roles.map((role,i)=>({id:i+1,stage:i===0?'Department Manager':i===1?'Finance':cents>=2000000?'Executive Approver':'Operations Director',role,status:'Pending'}));}

