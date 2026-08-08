// Authentication and local storage utilities

export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
  localStorage.setItem('tokenTime', new Date().getTime());
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('tokenTime');
};

export const isTokenExpired = () => {
  const tokenTime = localStorage.getItem('tokenTime');
  if (!tokenTime) return true;
  const expiryTime = 7 * 24 * 60 * 60 * 1000; // 7 days
  return Date.now() - tokenTime > expiryTime;
};

export const setUserData = (type, userData) => {
  localStorage.setItem('userType', type);
  if (userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
  }
};

export const getUserData = () => {
  const data = localStorage.getItem('userData');
  return data ? JSON.parse(data) : null;
};

export const getUserType = () => {
  return localStorage.getItem('userType');
};

export const clearUserData = () => {
  localStorage.removeItem('userType');
  localStorage.removeItem('userData');
  localStorage.removeItem('token');
  localStorage.removeItem('tokenTime');
};

export const isAuthenticated = () => {
  return getAuthToken() && !isTokenExpired();
};
