// @vitest-environment node
import {expect,it} from 'vitest';
import config from '../vite.config';
it('uses the deployment base for a self-contained hash-routed static build',()=>{expect(config.base).toBe('/opspilot/')});
