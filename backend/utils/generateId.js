import Counter from '../models/Counter.js';

export const generateIssueId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'report' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `GRS-${randomStr}`;
};


