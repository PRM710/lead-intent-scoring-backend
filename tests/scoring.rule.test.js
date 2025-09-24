const scoring = require('../scoring');

test('roleRelevance detects decision makers', () => {
  expect(scoring.roleRelevance('CEO')).toBe(20);
  expect(scoring.roleRelevance('Head of Growth')).toBe(20);
  expect(scoring.roleRelevance('Marketing Manager')).toBe(10);
  expect(scoring.roleRelevance('Software Engineer')).toBe(0);
});

test('dataCompleteness returns 10 only when fields present', () => {
  const full = { name: 'A', role: 'B', company: 'C', industry: 'D', location: 'E', linkedin_bio: 'bio' };
  expect(scoring.dataCompleteness(full)).toBe(10);
  const missing = { ...full, role: '' };
  expect(scoring.dataCompleteness(missing)).toBe(0);
});
