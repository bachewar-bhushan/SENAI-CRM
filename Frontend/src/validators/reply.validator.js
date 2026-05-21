export const validateReply = (message) => {
  if (!message || message.trim().length === 0) {
    return 'Reply cannot be empty';
  }
  if (message.trim().length < 10) {
    return 'Reply must be at least 10 characters';
  }
  return null;
};
