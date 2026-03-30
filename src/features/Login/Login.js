import {
  LockRounded,
  PersonRounded,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import {
  Alert,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import classNames from 'classnames/bind';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import paths from '~/routes/paths';
import styles from './Login.module.scss';

const cx = classNames.bind(styles);

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!username || !password) {
            setError('Vui lòng nhập đầy đủ thông tin.');
            return;
        }
        setLoading(true);
        // Giả lập API
        setTimeout(() => setLoading(false), 1500);
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
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockRounded sx={{ fontSize: '2.4rem' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {error && <Alert severity="error" sx={{ fontSize: '1.4rem' }}>{error}</Alert>}

                        <Button 
                            className={cx('submitBtn')} 
                            type="submit" 
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={28} color="inherit" /> : 'ĐĂNG NHẬP'}
                        </Button>
                    </Stack>
                </form>

                <div className={cx('footerLinks')}>
                    <Link to={paths.forgotPassword}>Quên mật khẩu?</Link>
                    <div className={cx('divider')}></div>
                    <span>Bạn chưa có tài khoản? <Link to={paths.register} className={cx('highlight')}>Đăng ký ngay</Link></span>
                </div>
            </div>
        </main>
    );
}