/**
 * PROTECTED ROUTE
 *
 * `roles` gates admin screens. Role names come from `roles[]` on
 * `/users/myInfo`; compare case-insensitively so `admin` and `ADMIN` both match
 * the `roles: ['ADMIN']` declared in `~/routes`.
 */
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useUser } from '~/providers/UserContext';
import paths from '~/routes/paths';

const ProtectedRoute = ({ children, roles = null }) => {
  const { isLoggedIn, userData } = useUser();

  if (!isLoggedIn) {
    toast.warning('Bạn cần phải đăng nhập để có thể truy cập');
    return <Navigate to={paths.login} />;
  }

  if (roles) {
    const owned = (userData?.roles ?? []).map((r) => String(r).toUpperCase());
    const allowed = roles.map((r) => String(r).toUpperCase());
    if (!allowed.some((role) => owned.includes(role))) {
      toast.warning('Bạn cần phải có quyền để có thể truy cập');
      return <Navigate to={paths.unauthorized} />;
    }
  }

  return children;
};

export default ProtectedRoute;

