import { AlertTriangle, ChevronDown, Info, Sparkles } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import type { User } from './api';
import { reviewState, suggestion } from './aiReview';
import type { RequestValues, ReviewField } from './aiReview';

export type AIResult = { request_type:string; suggested_priority:string; suggested_department:string; summary:string; business_impact:string|null; extracted_details:Record<string,string|null>; missing_information:string[]; explanation:string; needs_human_review:boolean };
export type AIAnalysis = { id:number; request_id:number|null; initiated_by_user_id:number; model_name:string; model_identifier:string|null; structured_result:AIResult; validation_flags:string[]; accepted_fields:string[]|null; submitted_changes:Record<string,{suggested:string;submitted:string|null}>|null; review_decision:string|null; created_at:string; reviewed_at:string|null };
type CurrentValues = RequestValues & { department?: string };
type Props = { analysis: AIAnalysis; values: CurrentValues; selected?: ReviewField[]; onApply?: (fields: ReviewField[]) => void; stale?: boolean; users?: User[] };
const fields: { key: ReviewField; label: string }[] = [{key:'request_type',label:'Request type'},{key:'priority',label:'Priority'}];
const readableField = (name:string) => name.replaceAll('_',' ').replace(/^\w/, letter => letter.toUpperCase());
function toggleDisclosure(event: KeyboardEvent<HTMLElement>) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    event.currentTarget.parentElement?.toggleAttribute('open');
  }
}

export function AnalysisPanel({analysis,values,selected=[],onApply,stale=false,users=[]}: Props) {
  const a = analysis.structured_result;
  const draft = !!onApply;
  const applicable = fields.filter(({key}) => values[key] !== suggestion(a,key)).map(({key}) => key);
  const details = Object.entries(a.extracted_details ?? {}).filter(([,value]) => value != null && value !== '');
  const warnings = analysis.validation_flags ?? [];
  const reviewer = users.find(user => user.id === analysis.initiated_by_user_id)?.name;
  return <section className="ai-analysis" aria-label="AI analysis">
    <div className="ai-heading"><div><div className="ai-kicker"><Sparkles size={15} aria-hidden="true"/> AI REQUEST INTELLIGENCE</div><h3>AI recommendations</h3></div>
      {draft && <button type="button" className="ai-apply-all" disabled={stale || applicable.length === 0} onClick={() => onApply(applicable)}>Apply all suggestions</button>}
    </div>
    <p className="ai-disclaimer">AI suggestions need human review. Department routing is informational and does not assign work.</p>
    {stale && <p className="ai-notice ai-notice-warning" role="alert"><AlertTriangle size={17} aria-hidden="true"/> The description changed. Reanalyze to attach this result, or submit manually.</p>}
    <div className="ai-recommendations">
      {fields.map(({key,label}) => {
        const recommended = suggestion(a,key);
        const accepted = draft ? selected.includes(key) : (analysis.accepted_fields ?? []).includes(key);
        const submitted = analysis.submitted_changes?.[key]?.submitted;
        const state = reviewState(recommended, draft ? values[key] : submitted, accepted);
        return <div className="ai-recommendation" key={key}>
          <div><span className="ai-field-label">{label}</span><strong>{recommended}</strong>
            {!draft && <span className="ai-final-value">Submitted at review: {submitted ?? 'Unavailable'}</span>}
            {!draft && <span className="ai-final-value">Current request: {values[key]}</span>}
          </div>
          <div className="ai-rec-action"><span className="ai-state">{!draft ? 'Review: ' : ''}{!draft && submitted == null ? 'Unavailable' : state}</span>
            {draft && values[key] !== recommended && <button type="button" className="ai-apply" disabled={stale} aria-label={`Apply ${label.toLowerCase()} suggestion: ${recommended}`} onClick={() => onApply([key])}>Apply</button>}
          </div>
        </div>;
      })}
      <div className="ai-recommendation"><div><span className="ai-field-label">Suggested routing</span><strong>{a.suggested_department}</strong>{!draft && <span className="ai-final-value">Current assignment: {values.department ?? 'Unavailable'}</span>}</div><span className="ai-state">Recommendation only</span></div>
    </div>
    <section className="ai-section"><h4>Business impact</h4><p>{a.summary}</p><p>{a.business_impact || 'Business impact was not specified.'}</p>
      {(a.needs_human_review || warnings.length > 0) && <div className="ai-notice ai-notice-warning"><AlertTriangle size={17} aria-hidden="true"/><div>Human review required. Verify the recommendations before acting.{warnings.length > 0 && <ul>{warnings.map((flag,i)=><li key={i}>{flag}</li>)}</ul>}</div></div>}
    </section>
    <section className="ai-section"><h4>Missing information</h4>{a.missing_information?.length ? <ul className="ai-missing">{a.missing_information.map((question,i)=><li key={i}><Info size={16} aria-hidden="true"/><span>{question}</span></li>)}</ul> : <p>No missing information identified.</p>}<p className="ai-helper">These questions are suggestions, not required fields.</p></section>
    <details className="ai-disclosure"><summary onKeyDown={toggleDisclosure}>View detailed analysis <ChevronDown size={16} aria-hidden="true"/></summary><div className="ai-disclosure-body"><h4>Extracted details</h4>{details.length ? <dl className="ai-details">{details.map(([key,value])=><div key={key}><dt>{readableField(key)}</dt><dd>{value}</dd></div>)}</dl> : <p>No details identified.</p>}<h4>Explanation</h4><p>{a.explanation}</p><p className="ai-meta">Model: {analysis.model_identifier || analysis.model_name} · Analyzed {new Date(analysis.created_at).toLocaleString()}</p></div></details>
    {!draft && <details className="ai-disclosure"><summary onKeyDown={toggleDisclosure}>Review details <ChevronDown size={16} aria-hidden="true"/></summary><div className="ai-disclosure-body"><p>Review: {analysis.review_decision ?? 'Unavailable'}{reviewer ? ` by ${reviewer}` : analysis.initiated_by_user_id ? ' by an unavailable user' : ''}{analysis.reviewed_at ? ` · ${new Date(analysis.reviewed_at).toLocaleString()}` : ''}</p>
      {fields.map(({key,label})=>{const change=analysis.submitted_changes?.[key];return <p key={key}>{label}: suggested {suggestion(a,key)}; submitted {change?.submitted ?? 'unavailable'}; review {change?.submitted == null ? 'unavailable' : reviewState(suggestion(a,key),change.submitted,(analysis.accepted_fields??[]).includes(key))}.</p>})}
      <p>Department: suggested {a.suggested_department}; submitted assignment {analysis.submitted_changes?.department?.submitted ?? 'not recorded'}. {analysis.accepted_fields?.includes('department') ? 'The routing suggestion was selected during review; it did not assign work.' : 'Recommendation only; it did not assign work.'}</p>
    </div></details>}
  </section>;
}

export function AnalysisHistory({analyses,loading,error,values,users}:{analyses?:AIAnalysis[];loading:boolean;error:unknown;values:CurrentValues;users:User[]}) {
  return <section className="panel ai-history"><div className="section-title"><div><h2>AI analysis</h2><p>Recommendations and human review for this request</p></div></div>{loading ? <p role="status">Loading analyses…</p> : error ? <div className="error" role="alert">{error instanceof Error ? error.message : 'Unable to load AI analyses.'}</div> : analyses?.length ? analyses.map(analysis=><AnalysisPanel key={analysis.id} analysis={analysis} values={values} users={users}/>) : <p>No reviewed AI analysis for this request.</p>}</section>;
}
