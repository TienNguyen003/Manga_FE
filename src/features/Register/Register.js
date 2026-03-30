import {
  AppRegistrationRounded,
  EmailRounded,
  LockRounded,
  PersonRounded,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import {
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
import styles from './Register.module.scss';

const cx = classNames.bind(styles);

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Giả lập xử lý đăng ký
        setTimeout(() => setLoading(false), 1500);
    };

    return (
        <main className={cx('registerPage')}>
            <div className={cx('content')}>
                <Typography variant="h2" className={cx('pageTitle')}>
                    Gia Nhập Cộng Đồng
                </Typography>
                
                <Typography className={cx('subTitle')}>
                    Bắt đầu hành trình sáng tạo và thưởng thức truyện tranh của bạn ngay hôm nay.
                </Typography>

                <form className={cx('form')} onSubmit={handleSubmit}>
                    <Stack spacing={3.5}>
                        <TextField
                            fullWidth
                            label="Tên người dùng"
                            variant="outlined"
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><PersonRounded /></InputAdornment>,
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Địa chỉ Email"
                            variant="outlined"
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><EmailRounded /></InputAdornment>,
                            }}
                        />

                        <TextField
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            label="Mật khẩu"
                            variant="outlined"
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><LockRounded /></InputAdornment>,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            type="password"
                            label="Xác nhận mật khẩu"
                            variant="outlined"
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><LockRounded /></InputAdornment>,
                            }}
                        />

                        <Button 
                            className={cx('submitBtn')} 
                            type="submit" 
                            disabled={loading}
                            startIcon={!loading && <AppRegistrationRounded />}
                        >
                            {loading ? <CircularProgress size={28} color="inherit" /> : 'TẠO TÀI KHOẢN'}
                        </Button>
                    </Stack>
                </form>

                <div className={cx('footerLinks')}>
                    <span>Đã có tài khoản? <Link to={paths.login} className={cx('highlight')}>Đăng nhập</Link></span>
                </div>
            </div>
        </main>
    );
}