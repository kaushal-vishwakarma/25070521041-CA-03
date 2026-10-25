// How complete is a student's profile? Counted from real fields (nothing is invented).
export const profileCompleteness = (user) => {
  const checks = [
    { label: 'college', done: Boolean(user?.college?.trim()) },
    { label: 'skills', done: (user?.skills?.length || 0) > 0 },
    { label: 'resume link', done: Boolean(user?.resumeUrl?.trim()) },
    { label: 'short bio', done: Boolean(user?.bio?.trim()) },
  ];
  const done = checks.filter((c) => c.done).length;
  return {
    percent: Math.round((done / checks.length) * 100),
    missing: checks.filter((c) => !c.done).map((c) => c.label),
  };
};
