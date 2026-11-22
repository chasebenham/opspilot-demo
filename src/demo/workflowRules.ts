import type {Task} from './types';
export function canStart(task:Task,tasks:Task[]){return task.dependencies.every(id=>tasks.find(t=>t.id===id)?.status==='Completed');}
export function unlock(tasks:Task[]){for(const task of tasks)if(task.status==='Blocked'&&canStart(task,tasks))task.status='Ready';}
