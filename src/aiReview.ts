import type { AIResult } from './AIAnalysis';

export type ReviewField = 'request_type' | 'priority';
export type RequestValues = { request_type: string; priority: string };
export type ReviewState = 'Applied' | 'Modified' | 'Matched' | 'Not applied';

export function isAnalysisStale(source: string, current: string) { return source.trim() !== current.trim(); }
export function reviewedAnalysisPayload(analysisId: number | null, stale: boolean, acceptedFields: ReviewField[]) {
  return analysisId !== null && !stale ? { analysis_id: analysisId, accepted_ai_fields: acceptedFields } : {};
}
export function suggestion(result: AIResult, field: ReviewField) {
  return field === 'request_type' ? result.request_type : result.suggested_priority;
}
export function reviewState(suggested: string, finalValue: string | null | undefined, applied: boolean): ReviewState {
  if (applied) return finalValue === suggested ? 'Applied' : 'Modified';
  return finalValue === suggested ? 'Matched' : 'Not applied';
}
export function applySuggestions(values: RequestValues, applied: ReviewField[], result: AIResult, fields: ReviewField[]) {
  const next = { ...values };
  const accepted = [...applied];
  for (const field of fields) {
    const value = suggestion(result, field);
    if (next[field] !== value) {
      next[field] = value;
      if (!accepted.includes(field)) accepted.push(field);
    }
  }
  return { values: next, accepted };
}
