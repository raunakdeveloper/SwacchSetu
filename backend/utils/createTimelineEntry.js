export const createTimelineEntry = (status, message, userId, meta = null) => {
  return {
    status,
    message,
    by: userId,
    meta,
  };
};
