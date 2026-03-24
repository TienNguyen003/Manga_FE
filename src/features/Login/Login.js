import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }
  };

  return (
    <main className={cx('loginPage')}>
      <div className={cx('container-fluid')}>
        <section className={cx('hero')}>
          <h1>Đăng nhập</h1>
          <p>Đăng nhập để sử dụng đầy đủ tính năng cá nhân hóa.</p>
        </section>
        <form className={cx('form')} onSubmit={handleSubmit}>
          <div className={cx('formGroup')}>
            <label>Tên đăng nhập</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tên đăng nhập hoặc email" />
          </div>
          <div className={cx('formGroup')}>
            <label>Mật khẩu</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu" />
          </div>
          {error && <div className={cx('error')}>{error}</div>}
          {success && <div className={cx('success')}>Đăng nhập thành công! (Demo)</div>}
          <button type="submit" className={cx('submitBtn')}>
            Đăng nhập
          </button>
        </form>
        <div className={cx('links')}>
          <Link to="/dang-ky">Chưa có tài khoản? Đăng ký</Link>
          <Link to="/quen-mat-khau">Quên mật khẩu?</Link>
        </div>
      </div>
    </main>
  );
}
