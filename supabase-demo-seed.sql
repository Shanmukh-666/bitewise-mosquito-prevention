-- Optional synthetic records for demonstrations only.
-- Run this only after supabase-setup.sql. These rows are not survey findings.
insert into public.prevention_assessments (
  is_demo, language, uncovered_container, cleaning_frequency,
  stagnant_water, open_drain, waste_collecting_items, mosquito_presence,
  barrier, issue_scope, recommendations, action_status, recurrence_reported
) values (
  true, 'te', true, 'sometimes', true, false, true, 'often',
  'routine', 'household', '[]'::jsonb, 'pending', false
);
