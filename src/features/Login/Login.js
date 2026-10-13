/**
 * LOGIN
 *
 * Rule 1: the session lives at `data.result`.
 * Rule 4: `RATE_LIMITED` (429 — 5 attempts / 10 min) must NOT log the user out
 * and must NOT clear the form. It just asks them to wait.
 */
import { LockRounded, PersonRounded, Visibility, VisibilityOff } from '@mui/icons-material';
import { Alert, Button, CircularProgress, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import paths from '~/routes/paths';
import { login as authLogin } from '~/services/authService';
import { errorCode, errorFields, errorMessage } from '~/lib/httpRequest';
import { useUser } from '~/providers/UserContext';

import styles from './Login.module.scss';

const cx = classNames.bind(styles);

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { login } = useUser();

  // The interceptor redirects here with `?reason=banned` when it sees
  // `ACCOUNT_BANNED`. Surface it once, then strip it from the URL.
  useEffect(() => {
    if (searchParams.get('reason') === 'banned') {
      toast.error('Tài khoản của bạn đã bị khoá. Vui lòng liên hệ hỗ trợ.');
      searchParams.delete('reason');
      navigate({ pathname: paths.login, search: searchParams.toString() }, { replace: true });
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authLogin({ username, password });
      const auth = data.result;

      // `status === 1` means the account is locked. Do not sign them in.
      if (Number(auth?.status) === 1) {
        setError('Tài khoản của bạn đã bị khoá. Vui lòng liên hệ hỗ trợ.');
        return;
      }

      login(auth);
      toast.success('Đăng nhập thành công!');
      navigate(paths.home);
    } catch (err) {
      const code = errorCode(err);

      // Throttled: keep the form, do not clear storage, do not redirect.
      if (code === 'RATE_LIMITED') {
        setError('Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 10 phút.');
        return;
      }

      // Wrong credentials -> an inline form error, not a toast.
      if (code === 'INVALID_CREDENTIALS') {
        setError('Tên đăng nhập hoặc mật khẩu không đúng.');
        return;
      }

      if (code === 'VALIDATION_FAILED') {
        const fields = {};
        errorFields(err).forEach((f) => {
          if (f?.field) fields[f.field] = f.message;
        });
        setFieldErrors(fields);
        setError('Vui lòng kiểm tra lại thông tin đã nhập.');
        return;
      }

      const message = errorMessage(err, 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      setError(message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className={cx('loginPage')}>
      <div className={cx('content')}>
        <Typography variant="h2" className={cx('pageTitle')}>
          Chào Mừng Trở Lại
        </Typography>

        <form className={cx('form')} onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <TextField
              fullWidth
              label="Tên đăng nhập / Email"
              variant="outlined"
              value={username}
              error={Boolean(fieldErrors.username || fieldErrors.email)}
              helperText={fieldErrors.username || fieldErrors.email || ''}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonRounded sx={{ fontSize: '2.4rem' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Mật khẩu"
              variant="outlined"
              value={password}
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password || ''}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRounded sx={{ fontSize: '2.4rem' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {error && (
              <Alert severity="error" sx={{ fontSize: '1.4rem' }}>
                {error}
              </Alert>
            )}

            <Button className={cx('submitBtn')} type="submit" disabled={loading}>
              {loading ? <CircularProgress size={28} color="inherit" /> : 'ĐĂNG NHẬP'}
            </Button>
          </Stack>
        </form>

        <div className={cx('footerLinks')}>
          <Link to={paths.forgotPassword}>Quên mật khẩu?</Link>
          <div className={cx('divider')}></div>
          <span>
            Bạn chưa có tài khoản?{' '}
            <Link to={paths.register} className={cx('highlight')}>
              Đăng ký ngay
            </Link>
          </span>
        </div>
      </div>
    </main>
  );
}
