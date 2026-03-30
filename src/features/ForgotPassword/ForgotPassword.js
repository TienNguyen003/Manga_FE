import { ArrowBackRounded, EmailRounded } from '@mui/icons-material';
import {
  Alert,
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import classNames from 'classnames/bind';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import paths from '~/routes/paths';
import styles from './ForgotPassword.module.scss';

const cx = classNames.bind(styles);

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setStatus({ type: 'error', msg: 'Vui lòng nhập email để lấy lại mật khẩu.' });
            return;
        }
        setLoading(true);
        // Giả lập gửi mail
        setTimeout(() => {
            setLoading(false);
            setStatus({ type: 'success', msg: 'Yêu cầu đã được gửi! Vui lòng kiểm tra hộp thư.' });
        }, 1500);
    };

    return (
        <main className={cx('forgotPage')}>
            <div className={cx('content')}>
                <Typography variant="h2" className={cx('pageTitle')}>
                    Khôi Phục Mật Khẩu
                </Typography>
                
                <Typography className={cx('subTitle')}>
                    Đừng lo lắng, hãy nhập email của bạn và chúng tôi sẽ gửi hướng dẫn khôi phục.
                </Typography>

                <form className={cx('form')} onSubmit={handleSubmit}>
                    <Stack spacing={4}>
                        <TextField
                            fullWidth
                            label="Email đăng ký"
                            variant="outlined"
                            placeholder="example@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailRounded sx={{ fontSize: '2.4rem' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {status.msg && (
                            <Alert severity={status.type} sx={{ fontSize: '1.4rem' }}>
                                {status.msg}
                            </Alert>
                        )}

                        <Button 
                            className={cx('submitBtn')} 
                            type="submit" 
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={28} color="inherit" /> : 'GỬI YÊU CẦU'}
                        </Button>
                    </Stack>
                </form>

                <Link to={paths.login} className={cx('backLink')}>
                    <ArrowBackRounded /> Quay lại đăng nhập
                </Link>
            </div>
        </main>
    );
}