
export const getDefaultSiteId = () => {
  // Get from localStorage (set after fetching sites)
  const storedSiteId = localStorage.getItem('siteId');
  if (storedSiteId) {
    return storedSiteId;
  }
  
  // Fallback - should be set after sites are fetched
  console.warn('No siteId found in localStorage. Please fetch sites first.');
  return null;
};

export const dateToUtc = (date) => {
  if (!date) return 0;
  const d = date instanceof Date ? date : new Date(date);
  return d.getTime();
};

export const getDayUtcRange = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  
  // Get date string in YYYY-MM-DD format
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  // Create UTC timestamps for start and end of day
  // Using UTC methods to ensure we get UTC midnight
  const startOfDay = new Date(Date.UTC(year, d.getMonth(), d.getDate(), 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(year, d.getMonth(), d.getDate(), 23, 59, 59, 999));
  
  return {
    fromUtc: startOfDay.getTime(),
    toUtc: endOfDay.getTime()
  };
};

export const buildAnalyticsPayload = (options = {}) => {
  const { date, additionalData = {} } = options;
  const { fromUtc, toUtc } = getDayUtcRange(date);
  
  return {
    siteId: getDefaultSiteId(),
    fromUtc,
    toUtc,
    ...additionalData
  };
};

export const buildEntryExitPayload = (options = {}) => {
  const { pageNumber = 1, pageSize = 50, date, siteId, additionalData = {} } = options;
  const { fromUtc, toUtc } = getDayUtcRange(date);
  const finalSiteId = siteId || getDefaultSiteId();
  
  if (!finalSiteId) {
    console.error('No siteId available. Please ensure sites are fetched.');
  }
  
  return {
    siteId: finalSiteId,
    fromUtc,
    toUtc,
    pageNumber,
    pageSize,
    ...additionalData
  };
};

