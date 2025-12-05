import { useEffect } from "react";
import Layout from "./layout/Layout";
import Admin from "./layout/Admin-Layout.jsx";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, role, token, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log("Auth State:", { user, role, token, isAuthenticated });
  }, [user, role, token, isAuthenticated]);

  return <>{isAuthenticated && role === "admin" ? <Admin /> : <Layout />}</>;
}

export default App;
