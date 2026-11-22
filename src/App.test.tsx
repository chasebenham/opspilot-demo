// @vitest-environment jsdom
import React from 'react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {cleanup,render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {HashRouter} from 'react-router-dom';
import {App} from './main';
import {reset} from './demo/demoStore';
function renderAt(hash:string){window.location.hash=hash;render(<HashRouter><App/></HashRouter>)}
beforeEach(()=>{localStorage.clear();reset()});
afterEach(()=>{cleanup();vi.restoreAllMocks();delete document.documentElement.dataset.theme});
it('filters the locally persisted request table',async()=>{renderAt('#/requests');const user=userEvent.setup();expect(screen.getByText('Analytics software license')).toBeTruthy();await user.type(screen.getByLabelText('Search requests'),'CRM');expect(screen.getByText('CRM outage')).toBeTruthy();expect(screen.queryByText('Analytics software license')).toBeNull()});
it('replays an example and applies a recommendation before submission',async()=>{renderAt('#/requests/new');const user=userEvent.setup();await user.selectOptions(screen.getByLabelText('Load example'),'crm');await user.click(screen.getByRole('button',{name:'Show illustrative AI analysis'}));expect(screen.getByText('The CRM platform is down for the entire sales team.')).toBeTruthy();await user.click(screen.getByRole('button',{name:'Apply priority suggestion: High'}));expect(screen.getByText('Applied')).toBeTruthy();await user.click(screen.getByRole('button',{name:'Submit request'}));expect(await screen.findByText('CRM platform outage')).toBeTruthy()});
it('keeps arbitrary request entry available when AI replay is unavailable',async()=>{renderAt('#/requests/new');const user=userEvent.setup();await user.type(screen.getByLabelText('Description'),'A custom problem');await user.click(screen.getByRole('button',{name:'Show illustrative AI analysis'}));expect(screen.getByRole('alert').textContent).toContain('Live AI analysis is disabled')});
it('renders clearly labeled historical fixtures and changes ROI scenario',async()=>{renderAt('#/analytics');const user=userEvent.setup();expect(screen.getAllByText('Fictional fixture').length).toBe(4);await user.click(screen.getByRole('button',{name:'Business impact'}));await user.selectOptions(screen.getByLabelText('Scenario preset'),'Conservative');expect((screen.getByLabelText('Eligibility rate') as HTMLInputElement).value).toBe('0.4')});
it('persists theme and supports direct hash navigation',async()=>{renderAt('#/workflows');const user=userEvent.setup();expect(screen.getByRole('heading',{name:'Marketing campaign landing page launch'})).toBeTruthy();await user.selectOptions(screen.getByLabelText('Appearance'),'dark');expect(localStorage.getItem('demo-theme')).toBe('dark');expect(document.documentElement.dataset.theme).toBe('dark');cleanup();renderAt('#/workflows');expect((screen.getByLabelText('Appearance') as HTMLSelectElement).value).toBe('dark')});
