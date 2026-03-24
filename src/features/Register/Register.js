import React from 'react';
import styles from './Register.module.scss';

const Register = () => {
  return (
    <section className={styles.registerPage}>
      <div className={styles.formContainer}>
        <h1>Đăng ký tài khoản</h1>
        <form>
          <div className={styles.formGroup}>
            <label htmlFor="username">Tên đăng nhập</label>
            <input id="username" name="username" type="text" required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Mật khẩu</label>
            <input id="password" name="password" type="password" required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Nhập lại mật khẩu</label>
            <input id="confirmPassword" name="confirmPassword" type="password" required />
          </div>
          <button type="submit" className={styles.submitBtn}>
            Đăng ký
          </button>
        </form>
      </div>
    </section>
  );
};

export default Register;
