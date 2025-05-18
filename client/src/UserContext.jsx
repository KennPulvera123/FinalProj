import { createContext, useEffect, useState } from "react";
import axios from "axios";

// ✅ Global Axios Settings
axios.defaults.baseURL = 'http://localhost:5002';
axios.defaults.withCredentials = true;

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      axios.get('/api/profile')  // ✅ Corrected API Path
        .then(({ data }) => {
          setUser(data);
        })
        .catch((error) => {
          console.error('Failed to load profile:', error);
          setUser(null);
        })
        .finally(() => {
          setReady(true);
        });
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, ready }}>
      {children}
    </UserContext.Provider>
  );
}
