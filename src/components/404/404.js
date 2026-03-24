import { Link } from 'react-router-dom';
import styles from './404.module.scss';
import paths from '../../routes/paths';

const NotFound = () => {
  return (
    <section className={styles.notFoundPage}>
      <div className="container">
        <div className={styles.inner}>
          <p className={styles.code}>404</p>
          <h1>Trang bạn tìm không tồn tại</h1>
          <p className={styles.message}>Liên kết có thể đã thay đổi hoặc bị xóa. Bạn có thể quay lại trang chủ để tiếp tục đọc truyện.</p>
          <div className={styles.actions}>
            <Link to={paths.home} className={styles.primaryBtn}>
              Về trang chủ
            </Link>
            <Link to={paths.library} className={styles.ghostBtn}>
              Mở thư viện cá nhân
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
