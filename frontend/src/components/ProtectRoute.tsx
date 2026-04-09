import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authApi } from "../services/authAPI";

export default function ProtectedRoute({ children }: any) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    authApi.authCheck()
      .then(() => setIsAuth(true))
      .catch(() => setIsAuth(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return isAuth ? children : <Navigate to="/login" replace />;
}