// Escape user text before putting it in a RegExp, so input like ".*" or "(" cannot
// create expensive or invalid patterns (prevents ReDoS and regex injection).
export const escapeRegex = (text = '') => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Strict 24-hex-character check for MongoDB ObjectIds.
// (mongoose.isValidObjectId also accepts some 12-character strings, so we avoid it.)
export const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id));

// Turn "react, node.js ,, sql" or ["react", " node"] into a clean unique array.
export const normalizeList = (value, { max = 20, maxLength = 60 } = {}) => {
  const items = Array.isArray(value) ? value : String(value ?? '').split(',');
  const cleaned = items
    .map((item) => String(item).trim())
    .filter(Boolean)
    .map((item) => item.slice(0, maxLength));
  return [...new Set(cleaned)].slice(0, max);
};
