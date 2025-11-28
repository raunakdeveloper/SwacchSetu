export const generateIssueId = () => {
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `GRS-${randomStr}`;
};
