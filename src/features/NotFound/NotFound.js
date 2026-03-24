import React from 'react';
import classNames from 'classnames/bind';
import styles from './NotFound.module.scss';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

export default function NotFound() {
  return (
    <main className={cx('notFoundPage')}>
      <div className={cx('container-fluid')}>
        <section className={cx('hero')}>
          <h1>404</h1>
          <p>Không tìm thấy trang bạn yêu cầu.</p>
          <Link to="/" className={cx('homeBtn')}>
            Về trang chủ
          </Link>
        </section>
      </div>
    </main>
  );
}
