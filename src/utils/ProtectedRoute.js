import { Navigate } from 'react-router-dom';
import { useUser } from '~/providers/UserContext';
import { toast } from 'react-toastify';
import paths from '~/routes/paths';

const ProtectedRoute = ({ children, roles = null }) => {
    const { userData } = useUser();
    const isLoggedIn = !!userData;
    const userRole = userData?.role?.name || 'guest';

    if (!isLoggedIn) {
        toast.warning("Bạn cần phải đăng nhập để có thể truy cập")
        return <Navigate to={paths.login} />;
    }

    if (roles && !roles.includes(userRole)) {
        toast.warning("Bạn cần phải có quyền để có thể truy cập")
        return <Navigate to={paths.unauthorized} />;
    }

    return children;
};

export default ProtectedRoute;
