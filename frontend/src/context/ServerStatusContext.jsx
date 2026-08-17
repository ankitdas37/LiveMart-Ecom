import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ServerStatusContext = createContext();

export const ServerStatusProvider = ({ children }) => {
  const [isServerDown, setIsServerDown] = useState(false);

  useEffect(() => {
    // Add a global response interceptor to detect server crashes (Network Error)
    const interceptor = axios.interceptors.response.use(
      (response) => {
        // If we get any successful response, the server is definitely up
        if (isServerDown) setIsServerDown(false);
        return response;
      },
      (error) => {
        // Axios throws 'Network Error' or code 'ERR_NETWORK' when the backend is totally unreachable
        // Proxies like Vite or Nginx often return 502, 503, or 504 when the backend crashes
        const isNetworkError = !error.response && (error.message === 'Network Error' || error.code === 'ERR_NETWORK');
        const isGatewayError = error.response && [502, 503, 504].includes(error.response.status);
        
        if (isNetworkError || isGatewayError) {
          setIsServerDown(true);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [isServerDown]);

  // Function to manually retry connection
  const checkServerStatus = async () => {
    try {
      // Use relative URL so it respects axios.defaults.baseURL
      await axios.get('/api/products?limit=1', { timeout: 3000 });
      setIsServerDown(false);
      return true;
    } catch (error) {
      const isNetworkError = !error.response && (error.message === 'Network Error' || error.code === 'ERR_NETWORK');
      const isGatewayError = error.response && [502, 503, 504].includes(error.response.status);
      
      if (isNetworkError || isGatewayError) {
        setIsServerDown(true);
      } else {
        // If we got a 404 or 500, the server IS up and responding!
        setIsServerDown(false);
        return true;
      }
      return false;
    }
  };

  useEffect(() => {
    // Add a heartbeat to detect server crash instantly (every 10 seconds)
    const intervalId = setInterval(() => {
      checkServerStatus();
    }, 10000);
    
    // Also run an initial check
    checkServerStatus();

    return () => clearInterval(intervalId);
  }, []);

  return (
    <ServerStatusContext.Provider value={{ isServerDown, checkServerStatus, setIsServerDown }}>
      {children}
    </ServerStatusContext.Provider>
  );
};
