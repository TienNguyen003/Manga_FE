import React from 'react';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import paths from '~/routes/paths';

import styles from './footer.module.scss';

const cx = classNames.bind(styles);

export default function Footer() {
  return (
    <footer className={cx('footer')}>
      <div className={cx('shell')}>
        <section className={cx('brandCol')}>
          <div className={cx('brandBox')}>
            <span>WL</span>
          </div>
          <h3>WEB COMICS LAB</h3>
          <p>Nền tảng đọc truyện và theo dõi tiến độ đọc cho người dùng Việt. Phiên bản giao diện được thiết kế lại từ đầu.</p>
          <div className={cx('socials')}>
            <button type="button" aria-label="facebook">
              <i className="fa-brands fa-facebook-f"></i>
            </button>
            <button type="button" aria-label="instagram">
              <i className="fa-brands fa-instagram"></i>
            </button>
            <button type="button" aria-label="youtube">
              <i className="fa-brands fa-youtube"></i>
            </button>
          </div>
        </section>

        <section>
          <h4>Điều hướng nhanh</h4>
          <ul>
            <li>
              <Link to={paths.home}>Trang chủ</Link>
            </li>
            <li>
              <Link to={paths.discover}>Khám phá</Link>
            </li>
            <li>
              <Link to={paths.rankings}>Bảng xếp hạng</Link>
            </li>
            <li>
              <Link to={paths.advancedSearch}>Tìm kiếm nâng cao</Link>
            </li>
          </ul>
        </section>

        <section>
          <h4>Khu cá nhân</h4>
          <ul>
            <li>
              <Link to={paths.library}>Thư viện của tôi</Link>
            </li>
            <li>
              <Link to={paths.dashboard}>Bảng điều khiển</Link>
            </li>
            <li>
              <Link to={paths.notifications}>Thông báo</Link>
            </li>
          </ul>
        </section>

        <section>
          <h4>Phát triển tiếp</h4>
          <ul>
            <li>
              <button type="button">API đồng bộ lịch đọc</button>
            </li>
            <li>
              <button type="button">Gợi ý AI theo sở thích</button>
            </li>
            <li>
              <button type="button">Khu tác giả và nhóm dịch</button>
            </li>
          </ul>
        </section>
      </div>

      <p className={cx('copyright')}>© 2026 Web Comics Lab. Toàn bộ giao diện mới.</p>
    </footer>
  );
}
