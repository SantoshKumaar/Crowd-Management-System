import axios from "axios";

const getBaseURL = () => {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_BASE_URL || "/api";
  }
  return import.meta.env.VITE_API_BASE_URL || "https://hiring-dev.internal.kloudspot.com/api";
};

const customAxios = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

const requestHandler = (request) => {
  const token = localStorage.getItem("token");
  if (token) {
    request.headers["Authorization"] = `Bearer ${token}`;
  }
  return request;
};

const responseHandler = (response) => {
  const contentType = response.headers?.['content-type'] || '';
  if (contentType.includes('text/html')) {
    console.warn('Received HTML response instead of JSON. This might be an error page.');
    const error = new Error('Server returned an error page');
    error.response = response;
    error.isHtmlResponse = true;
    throw error;
  }
  
  return response;
};

const errorHandler = (error) => {
  const response = error.response;
  const requestUrl = error.config?.url || '';
  const baseURL = error.config?.baseURL || '';

  const isLoginEndpoint = requestUrl.includes('auth/login') || requestUrl.includes('login');

  if (!response) {
    console.error('Network Error Details:', {
      message: error.message,
      code: error.code,
      request: error.request,
      config: {
        url: requestUrl,
        baseURL: baseURL,
        method: error.config?.method,
        fullURL: baseURL + requestUrl
      }
    });
    
    if (error.request && error.request.status === 0) {
      if (!isLoginEndpoint) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
    
    const networkError = new Error(error.message || 'Network Error');
    networkError.isNetworkError = true;
    networkError.originalError = error;
    networkError.url = baseURL + requestUrl;
    return Promise.reject(networkError);
  }

  switch (response.status) {
    case 401:
      if (!isLoginEndpoint) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    case 403:
      if (!isLoginEndpoint) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    case 502:
      console.error('502 Bad Gateway - Server may be down or unreachable');
      const badGatewayError = new Error('Server is temporarily unavailable. Please try again later.');
      badGatewayError.isNetworkError = true;
      badGatewayError.status = 502;
      return Promise.reject(badGatewayError);
    case 503:
      // Service Unavailable
      const serviceUnavailableError = new Error('Service is temporarily unavailable. Please try again later.');
      serviceUnavailableError.isNetworkError = true;
      serviceUnavailableError.status = 503;
      return Promise.reject(serviceUnavailableError);
    case 404:
      return Promise.reject(error);
    case 400:
      // Bad Request - log detailed error information
      console.error('400 Bad Request Error:', {
        url: baseURL + requestUrl,
        method: error.config?.method,
        payload: error.config?.data,
        responseData: response.data,
        message: response.data?.message || response.data?.error || 'Bad Request - Invalid payload'
      });
      return Promise.reject(error);
    case 500:
      return Promise.reject(error);
    default:
      return Promise.reject(error);
  }
};

customAxios.interceptors.request.use(
  (request) => requestHandler(request),
  (error) => Promise.reject(error)
);

customAxios.interceptors.response.use(
  (response) => responseHandler(response),
  (error) => errorHandler(error)
);

export default customAxios;

