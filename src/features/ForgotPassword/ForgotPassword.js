import React from 'react';
import styles from './ForgotPassword.module.scss';

const ForgotPassword = () => {
  return (
    <section className={styles.forgotPasswordPage}>
      <div className={styles.formContainer}>
        <h1>Quên mật khẩu</h1>
        <form>
          <div className={styles.formGroup}>
            <label htmlFor="email">Nhập email đã đăng ký</label>
            <input id="email" name="email" type="email" required />
          </div>
          <button type="submit" className={styles.submitBtn}>
            Gửi yêu cầu
          </button>
        </form>
      </div>
    </section>
  );
};

export default ForgotPassword;
