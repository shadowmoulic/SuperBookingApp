import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import ModalContext from "../context/ModalContext";
import Loading from "./Loading";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const { openLoginModal } = useContext(ModalContext);

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to home and trigger the login modal
    openLoginModal();
    return <Navigate to="/" replace />;
  }

  return children;
}
