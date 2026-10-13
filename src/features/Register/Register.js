import { AppRegistrationRounded, EmailRounded, LockRounded, PersonRounded, Visibility, VisibilityOff } from '@mui/icons-material';
import { Button, CircularProgress, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { errorCode, errorFields, errorMessage } from '~/lib/httpRequest';
import paths from '~/routes/paths';
import { userService } from '~/services/userService';
import styles from './Register.module.scss';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

/** `409` — the username/email is already taken; highlight the offending field. */
export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    setLoading(true);
    try {
      // `confirmPassword` is client-only validation — never sent to the API.
      const { confirmPassword, ...payload } = formData;
      await userService.createUser(payload);
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate(paths.login);
    } catch (error) {
      const code = errorCode(error);

      // Duplicated username/email -> mark the field instead of a generic toast.
      if (code === 'USERNAME_ALREADY_EXISTS') {
        setFieldErrors({ username: 'Tên đăng nhập đã tồn tại.' });
        return;
      }
      if (code === 'SLUG_ALREADY_EXISTS') {
        setFieldErrors({ username: 'Tên đăng nhập đã tồn tại.' });
        return;
      }
      if (code === 'VALIDATION_FAILED') {
        const fields = {};
        errorFields(error).forEach((f) => {
          if (f?.field) fields[f.field] = f.message;
        });
        setFieldErrors(fields);
        return;
      }

      toast.error(errorMessage(error, 'Đăng ký thất bại. Vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <main className={cx('registerPage')}>
      <div className={cx('content')}>
        <Typography variant="h2" className={cx('pageTitle')}>
          Gia Nhập Cộng Đồng
        </Typography>

        <form className={cx('form')} onSubmit={handleSubmit}>
          <Stack spacing={3.5}>
            <TextField
              fullWidth
              label="Tên đăng nhập"
              variant="outlined"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={Boolean(fieldErrors.username)}
              helperText={fieldErrors.username || ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonRounded />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Tên người dùng"
              variant="outlined"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={Boolean(fieldErrors.name)}
              helperText={fieldErrors.name || ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonRounded />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Địa chỉ Email"
              variant="outlined"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={Boolean(fieldErrors.email)}
              helperText={fieldErrors.email || ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailRounded />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Mật khẩu"
              variant="outlined"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password || ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRounded />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              type="password"
              label="Xác nhận mật khẩu"
              variant="outlined"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={Boolean(fieldErrors.confirmPassword)}
              helperText={fieldErrors.confirmPassword || ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRounded />
                  </InputAdornment>
                ),
              }}
            />

            <Button className={cx('submitBtn')} type="submit" disabled={loading} startIcon={!loading && <AppRegistrationRounded />}>
              {loading ? <CircularProgress size={28} color="inherit" /> : 'TẠO TÀI KHOẢN'}
            </Button>
          </Stack>
        </form>

        <div className={cx('footerLinks')}>
          <span>
            Đã có tài khoản?{' '}
            <Link to={paths.login} className={cx('highlight')}>
              Đăng nhập
            </Link>
          </span>
        </div>
      </div>
    </main>
  );
}
