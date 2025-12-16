import customAxios from "../interceptor/http-interceptor";
import { AppUrl } from "../config/AppUrl";


export const SitesService = {

  getAllSites: () => {
    return customAxios.get(AppUrl.getAllSites);
  },

  getSiteById: (siteId) => {
    return customAxios.get(AppUrl.getSiteById(siteId));
  },
};



