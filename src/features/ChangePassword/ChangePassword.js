import React, { useState } from 'react';
import classNames from 'classnames/bind';
import { 
    Box, Typography, TextField, Button, Stack, Alert, 
    InputAdornment, IconButton, CircularProgress 
} from '@mui/material';
import { LockResetRounded, VpnKeyRounded, Visibility, VisibilityOff } from '@mui/icons-material';
import styles from './ChangePassword.module.scss';
import { userService } from '~/services/userService';

const cx = classNames.bind(styles);

export default function ChangePassword() {
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', msg: '' });

        if (!oldPass || !newPass || !confirmPass) {
            setStatus({ type: 'error', msg: 'Vui lòng điền đủ các trường.' });
            return;
        }
        if (newPass !== confirmPass) {
            setStatus({ type: 'error', msg: 'Mật khẩu mới không khớp.' });
            return;
        }

        setLoading(true);
        try {
            const res = await userService.changePassword({ oldPassword: oldPass, newPassword: newPass });
            if (res?.data?.success) {
                setStatus({ type: 'success', msg: 'Đổi mật khẩu thành công!' });
                setOldPass(''); setNewPass(''); setConfirmPass('');
            } else {
                setStatus({ type: 'error', msg: 'Thất bại. Mật khẩu cũ không đúng?' });
            }
        } catch (err) {
            setStatus({ type: 'error', msg: 'Có lỗi xảy ra, thử lại sau.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={cx('changePassPage')}>
            <div className={cx('content')}>
                <Typography variant="h2" className={cx('pageTitle')}>
                    Bảo Mật Tài Khoản
                </Typography>
                
                <Typography className={cx('subTitle')}>
                    Cập nhật mật khẩu định kỳ để bảo vệ tác phẩm của bạn.
                </Typography>

                <form className={cx('form')} onSubmit={handleSubmit}>
                    <Stack spacing={4}>
                        <TextField
                            fullWidth
                            type={showPass ? 'text' : 'password'}
                            label="Mật khẩu hiện tại"
                            variant="outlined"
                            value={oldPass}
                            onChange={(e) => setOldPass(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <VpnKeyRounded />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            type={showPass ? 'text' : 'password'}
                            label="Mật khẩu mới"
                            variant="outlined"
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                        />

                        <TextField
                            fullWidth
                            type={showPass ? 'text' : 'password'}
                            label="Nhập lại mật khẩu mới"
                            variant="outlined"
                            value={confirmPass}
                            onChange={(e) => setConfirmPass(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPass(!showPass)}>
                                            {showPass ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {status.msg && <Alert severity={status.type} sx={{ fontSize: '1.4rem' }}>{status.msg}</Alert>}

                        <Button 
                            className={cx('submitBtn')} 
                            type="submit" 
                            disabled={loading}
                            startIcon={!loading && <LockResetRounded />}
                        >
                            {loading ? <CircularProgress size={28} color="inherit" /> : 'CẬP NHẬT MẬT KHẨU'}
                        </Button>
                    </Stack>
                </form>
            </div>
        </main>
    );
}