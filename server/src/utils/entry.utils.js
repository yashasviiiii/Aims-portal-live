export const extractEntryNumber = (email) => {
  const localPart = email.split("@")[0];

  // starts with 4 digits (year)
  const yearPattern = /^\d{4}/;

  if (!yearPattern.test(localPart)) return null;

  return localPart; // full entry number
};