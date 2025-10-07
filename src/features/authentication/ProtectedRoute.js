import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ component: Component, roles }) => {
    const { state } = useAuth();
    const isLoggedIn = state.isAuthenticated;
    const userRole = state.account?.role.name || 'guest';

    if (!isLoggedIn) {
        toast.warning("Bạn cần phải đăng nhập để có thể truy cập")
        return <Navigate to="/login" />;
    }

    if (roles && !roles.includes(userRole)) {
        toast.warning("Bạn cần phải có quyền để có thể truy cập")
        return <Navigate to="/unauthorized" />;
    }

    return <Component />;
};


export default ProtectedRoute;
