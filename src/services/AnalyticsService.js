import customAxios from "../interceptor/http-interceptor";
import { AppUrl } from "../config/AppUrl";

export const AnalyticsService = {

  getDwellTime: (data) => {
    console.log('AnalyticsService.getDwellTime: Payload:', JSON.stringify(data, null, 2));
    return customAxios.post(AppUrl.dwellTime, data);
  },

  getFootfall: (data) => {
    console.log('AnalyticsService.getFootfall: Payload:', JSON.stringify(data, null, 2));
    return customAxios.post(AppUrl.footfall, data);
  },

  getOccupancy: (data) => {
    console.log('AnalyticsService.getOccupancy: Payload:', JSON.stringify(data, null, 2));
    return customAxios.post(AppUrl.occupancy, data);
  },

  getDemographics: (data) => {
    console.log('AnalyticsService.getDemographics: Payload:', JSON.stringify(data, null, 2));
    return customAxios.post(AppUrl.demographics, data);
  },

  getEntryExit: (data) => {
    console.log('AnalyticsService.getEntryExit: Payload:', JSON.stringify(data, null, 2));
    return customAxios.post(AppUrl.entryExit, data);
  },
};

