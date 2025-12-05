import { useEffect, useState, useCallback } from "react";
import { getToken } from "../utils/tokenManager";

const useFetchData = (url, refreshKey = 0) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Get token using the proper token manager
      const token = getToken();
      
      if (!token) {
        throw new Error("No authentication token available");
      }
      
      const res = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message + "🤢");
      }
      setData(result.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  return { data, loading, error, refetch: fetchData };
};

export default useFetchData;
