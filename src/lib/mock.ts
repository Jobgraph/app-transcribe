import type { TranscriptResult } from './types';

export const MOCK_RESULT: TranscriptResult = {
  summary:
    'The team discussed Q2 priorities, agreed on the new pricing model, and assigned ownership for the launch checklist. Engineering will move to usage-based billing with a June 1 target, while the legacy dashboard is scheduled for deprecation by end of quarter.',
  decisions: [
    'Move to usage-based pricing starting June 1',
    'Deprecate the legacy dashboard by end of Q2',
    'Hire two additional engineers for the platform team',
    'Run a beta programme with 5 existing customers before public launch',
  ],
  actions: [
    { what: 'Draft pricing page copy', who: 'Sarah', by: '2024-05-15' },
    { what: 'Set up usage metering pipeline', who: 'Dev team', by: '2024-05-20' },
    { what: 'Send deprecation notice to legacy users', who: 'Mark', by: '2024-05-10' },
    { what: 'Recruit beta participants', who: 'CS team', by: '2024-05-12' },
    { what: 'Update API documentation', who: 'James', by: '2024-05-18' },
  ],
  followUpEmail: `Hi team,

Thanks for a productive session. Here's a quick recap:

- We're moving to usage-based pricing from June 1
- Legacy dashboard will be deprecated by end of Q2
- Two new engineers joining the platform team
- Beta programme launching with 5 existing customers

Please check the action items assigned to you and flag any blockers by EOD Friday.

Best,
[Your name]`,
};
