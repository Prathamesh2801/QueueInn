import { Navigate } from "react-router-dom";

export default function ProtectedRoutes({ children }) {
    // Check token in localStorage
    const token = localStorage.getItem("Token");

    if (!token) {
        // If no token, redirect to login
        return <Navigate to="/login" replace />;
    }

    // If token exists, render the protected children
    return children;
}
