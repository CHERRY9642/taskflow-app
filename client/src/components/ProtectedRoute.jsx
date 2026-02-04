import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ allowedRoles, children }) => {
    const { user, isLoading } = useSelector((state) => state.auth);

    if (isLoading) {
        return <div>Loading...</div>; // Or a nice spinner
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <div className="p-8 text-center text-red-500">Unauthorized Access</div>;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
