import React, { useState } from 'react';
import { userService } from '~/services/userService';
import classNames from 'classnames/bind';
import styles from './ChangePassword.module.scss';

const cx = classNames.bind(styles);

export default function ChangePassword() {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!oldPass || !newPass || !confirmPass) {
      setError('Vui lòng nhập đầy đủ các trường.');
      return;
    }
    if (newPass !== confirmPass) {
      setError('Mật khẩu mới không khớp.');
      return;
    }
    try {
      const res = await userService.changePassword({ oldPassword: oldPass, newPassword: newPass });
      if (res?.data?.success) {
        setSuccess(true);
      } else {
        setError('Đổi mật khẩu thất bại.');
      }
    } catch (err) {
      setError('Đổi mật khẩu thất bại.');
    }
  };

  return (
    <main className={cx('changePassPage')}>
      <div className={cx('container-fluid')}>
        <section className={cx('hero')}>
          <h1>Đổi mật khẩu</h1>
          <p>Đảm bảo tài khoản của bạn luôn an toàn. (Demo UI, cần nối backend sau)</p>
        </section>
        <form className={cx('form')} onSubmit={handleSubmit}>
          <div className={cx('formGroup')}>
            <label>
              Mật khẩu hiện tại <span style={{ color: 'red' }}>*</span>
            </label>
            <input type="password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} placeholder="Nhập mật khẩu hiện tại" />
          </div>
          <div className={cx('formGroup')}>
            <label>
              Mật khẩu mới <span style={{ color: 'red' }}>*</span>
            </label>
            <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Nhập mật khẩu mới" />
          </div>
          <div className={cx('formGroup')}>
            <label>
              Nhập lại mật khẩu mới <span style={{ color: 'red' }}>*</span>
            </label>
            <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="Nhập lại mật khẩu mới" />
          </div>
          {error && <div className={cx('error')}>{error}</div>}
          {success && <div className={cx('success')}>Đổi mật khẩu thành công! (Demo)</div>}
          <button type="submit" className={cx('submitBtn')}>
            Đổi mật khẩu
          </button>
        </form>
      </div>
    </main>
  );
}
