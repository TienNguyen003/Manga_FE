import React, { useEffect, useState } from 'react';
import { userService } from '~/services/userService';
import classNames from 'classnames/bind';
import styles from './Profile.module.scss';

const cx = classNames.bind(styles);

export default function Profile() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [bio, setBio] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    userService
      .getProfile()
      .then((res) => {
        if (!mounted) return;
        const data = res?.data || {};
        setUsername(data.username || '');
        setEmail(data.email || '');
        setBio(data.bio || '');
        // Avatar có thể là url hoặc null
        setAvatar(null); // Chỉ xử lý upload mới, không load url cũ ở đây
      })
      .catch(() => {
        if (mounted) setError('Không thể tải thông tin hồ sơ.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!username || !email) {
      setError('Vui lòng nhập tên và email.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('bio', bio);
      if (avatar) formData.append('avatar', avatar);
      const res = await userService.updateProfile(formData);
      if (res?.data?.success) {
        setSuccess(true);
      } else {
        setError('Cập nhật hồ sơ thất bại.');
      }
    } catch (err) {
      setError('Cập nhật hồ sơ thất bại.');
    }
  };

  return (
    <main className={cx('profilePage')}>
      <div className={cx('container-fluid')}>
        <section className={cx('hero')}>
          <h1>Hồ sơ cá nhân</h1>
          <p>Xem và chỉnh sửa thông tin tài khoản của bạn.</p>
        </section>
        {loading ? (
          <div>Đang tải thông tin...</div>
        ) : (
          <form className={cx('form')} onSubmit={handleSubmit}>
            <div className={cx('avatarWrap')}>
              <label htmlFor="avatar-upload" className={cx('avatarLabel')}>
                <div className={cx('avatar')}>{avatar ? <img src={URL.createObjectURL(avatar)} alt="avatar" /> : <span>🧑</span>}</div>
                <input id="avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setAvatar(e.target.files[0])} />
                <span className={cx('avatarEdit')}>Đổi ảnh đại diện</span>
              </label>
            </div>
            <div className={cx('formGroup')}>
              <label>
                Tên người dùng <span style={{ color: 'red' }}>*</span>
              </label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tên hiển thị" />
            </div>
            <div className={cx('formGroup')}>
              <label>
                Email <span style={{ color: 'red' }}>*</span>
              </label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
            </div>
            <div className={cx('formGroup')}>
              <label>Giới thiệu</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Giới thiệu ngắn về bạn" rows={3} />
            </div>
            {error && <div className={cx('error')}>{error}</div>}
            {success && <div className={cx('success')}>Cập nhật hồ sơ thành công!</div>}
            <button type="submit" className={cx('submitBtn')}>
              Lưu thay đổi
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
