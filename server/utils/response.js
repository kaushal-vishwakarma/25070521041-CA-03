// Consistent success response shape:
// { success: true, message, data, meta? }
export const sendSuccess = (res, statusCode, message, data = null, meta = undefined) => {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};
