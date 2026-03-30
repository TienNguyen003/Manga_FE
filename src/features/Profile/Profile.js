import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { 
    Box, Typography, TextField, Button, Stack, Alert, 
    Avatar, IconButton, CircularProgress, Badge 
} from '@mui/material';
import { PhotoCameraRounded, SaveRounded, AccountCircleRounded, EmailRounded, InfoRounded } from '@mui/icons-material';
import styles from './Profile.module.scss';
import { userService } from '~/services/userService';

const cx = classNames.bind(styles);

export default function Profile() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [bio, setBio] = useState('');
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setLoading(true);
        userService.getProfile()
            .then((res) => {
                const data = res?.data || {};
                setUsername(data.username || '');
                setEmail(data.email || '');
                setBio(data.bio || '');
                if (data.avatarUrl) setPreviewUrl(data.avatarUrl);
            })
            .catch(() => setStatus({ type: 'error', msg: 'Không thể tải hồ sơ.' }))
            .finally(() => setLoading(false));
    }, []);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('email', email);
            formData.append('bio', bio);
            if (avatarFile) formData.append('avatar', avatarFile);
            
            const res = await userService.updateProfile(formData);
            if (res?.data?.success) setStatus({ type: 'success', msg: 'Cập nhật thành công!' });
        } catch (err) {
            setStatus({ type: 'error', msg: 'Cập nhật thất bại.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <CircularProgress color="inherit" />
        </Box>
    );

    return (
        <main className={cx('profilePage')}>
            <div className={cx('content')}>
                <Typography variant="h2" className={cx('pageTitle')}>Hồ Sơ Của Bạn</Typography>

                <form className={cx('form')} onSubmit={handleSubmit}>
                    <Box className={cx('avatarSection')}>
                        <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                                <label htmlFor="avatar-upload" className={cx('uploadBtn')}>
                                    <PhotoCameraRounded />
                                    <input id="avatar-upload" type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                                </label>
                            }
                        >
                            <Avatar src={previewUrl} className={cx('mainAvatar')}>
                                {!previewUrl && username.charAt(0).toUpperCase()}
                            </Avatar>
                        </Badge>
                        <Typography className={cx('avatarHint')}>Nhấp vào máy ảnh để đổi ảnh đại diện</Typography>
                    </Box>

                    <Stack spacing={4}>
                        <TextField
                            fullWidth
                            label="Tên người dùng"
                            variant="outlined"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            InputProps={{
                                startAdornment: <AccountCircleRounded sx={{ mr: 1, color: '#999' }} />,
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Email"
                            variant="outlined"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            InputProps={{
                                startAdornment: <EmailRounded sx={{ mr: 1, color: '#999' }} />,
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Giới thiệu bản thân"
                            variant="outlined"
                            multiline
                            rows={4}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Chia sẻ một chút về bạn..."
                        />

                        {status.msg && <Alert severity={status.type} sx={{ fontSize: '1.4rem' }}>{status.msg}</Alert>}

                        <Button 
                            className={cx('submitBtn')} 
                            type="submit" 
                            disabled={submitting}
                            startIcon={submitting ? <CircularProgress size={24} color="inherit" /> : <SaveRounded />}
                        >
                            {submitting ? 'ĐANG LƯU...' : 'LƯU THÔNG TIN'}
                        </Button>
                    </Stack>
                </form>
            </div>
        </main>
    );
}