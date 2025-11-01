import { useCallback } from "react";

export const useSessionStorage: () => Record<string, any> = () => {
  const getItem = useCallback((key: string) => {
    try {
      const value = sessionStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      console.error("Error reading sessionStorage key:", key, err);
      return null;
    }
  }, []);

  const setItem = useCallback((key: string, value: any) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error("Error setting sessionStorage key:", key, err);
    }
  }, []);

  const removeItem = useCallback((key: string) => {
    try {
      sessionStorage.removeItem(key);
    } catch (err) {
      console.error("Error removing sessionStorage key:", key, err);
    }
  }, []);

  const clear = useCallback(() => {
    try {
      sessionStorage.clear();
    } catch (err) {
      console.error("Error clearing sessionStorage:", err);
    }
  }, []);

  return { getItem, setItem, removeItem, clear };
};
