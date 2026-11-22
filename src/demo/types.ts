import type { AIAnalysis } from '../AIAnalysis';
export type Role='Employee'|'Department Agent'|'Department Manager'|'Finance Approver'|'Operations Admin'|'Operations Director'|'Executive Approver';
export type User={id:number;name:string;role:Role;department_id:number};
export type Department={id:number;name:string};
export type Event={id:number;at:string;actor:string;message:string};
export type Approval={id:number;stage:string;role:Role;status:'Pending'|'Approved'|'Rejected'|'Invalidated';actor?:string;reason?:string};
export type RequestItem={id:number;human_readable_id:string;title:string;description:string;request_type:string;priority:string;status:string;requester_id:number;assigned_department_id:number|null;assigned_user_id:number|null;created_at:string;events:Event[];analysis?:AIAnalysis;amountCents?:number;vendor?:string;justification?:string;approvals?:Approval[];due_at?:string;acknowledged_at?:string;escalated?:boolean};
export type Task={id:string;title:string;department_id:number;assigned_user_id:number|null;status:'Blocked'|'Ready'|'In Progress'|'Completed';dependencies:string[];required:boolean};
export type Project={id:number;title:string;owner_id:number;status:'Active'|'Completed';tasks:Task[];events:Event[]};
export type DemoState={version:1;guide?:'incident'|'purchase'|'project';userId:number;clock:string;requests:RequestItem[];projects:Project[]};

