
export const getCurrentSite = () => {
  const siteData = localStorage.getItem('currentSite');
  if (siteData) {
    return JSON.parse(siteData);
  }
  return null;
};


export const setCurrentSite = (site) => {
  if (site && site.siteId) {
    localStorage.setItem('currentSite', JSON.stringify(site));
    localStorage.setItem('siteId', site.siteId);
  }
};

export const getStoredSites = () => {
  const sitesData = localStorage.getItem('sites');
  if (sitesData) {
    return JSON.parse(sitesData);
  }
  return [];
};

export const setStoredSites = (sites) => {
  if (Array.isArray(sites) && sites.length > 0) {
    localStorage.setItem('sites', JSON.stringify(sites));
    // Set first site as default if no site is selected
    if (!getCurrentSite()) {
      setCurrentSite(sites[0]);
    }
  }
};



