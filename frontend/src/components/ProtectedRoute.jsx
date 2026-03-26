import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { Children } from "react";

const ProtectedRoute = ({ allowedRoles, children}) => {
    const { user } = useAuthStore();

    if(!user) return <Navigate to="/login" />;
    if(!allowedRoles.includes(user.role)) return <Navigate to="/login" />;
    
    return children;
};

export default ProtectedRoute;