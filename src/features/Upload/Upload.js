import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import { 
    Box, TextField, Button, Typography, Autocomplete, 
    Chip, Paper, CircularProgress, Alert, Stack 
} from '@mui/material';
import { AddPhotoAlternateRounded, SendRounded } from '@mui/icons-material';
import styles from './Upload.module.scss';
import { comicService } from '~/services/comicService';

const cx = classNames.bind(styles);

const GENRES = ['Hành động', 'Hài hước', 'Kinh dị', 'Tình cảm', 'Phiêu lưu', 'Giả tưởng', 'Học đường', 'Trinh thám'];

export default function Upload() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [cover, setCover] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });

    useEffect(() => {
        if (!cover) return;
        const url = URL.createObjectURL(cover);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [cover]);

    const handleUpload = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('genres', JSON.stringify(selectedGenres));
            formData.append('cover', cover);
            await comicService.uploadComic(formData);
            setStatus({ type: 'success', msg: 'Đã đăng truyện thành công!' });
        } catch {
            setStatus({ type: 'error', msg: 'Lỗi hệ thống, thử lại sau.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('uploadPage')}>
            <div className={cx('content')}>
                <Typography variant="h2" className={cx('pageTitle')}>
                    Tạo Tác Phẩm Mới
                </Typography>

                <form onSubmit={handleUpload}>
                    <Stack spacing={6}>
                        {/* Phần Ảnh Bìa */}
                        <Box className={cx('section')}>
                            <Typography className={cx('sectionLabel')}>1. Hình ảnh đại diện</Typography>
                            <label className={cx('coverUpload', { hasPreview: !!preview })}>
                                {preview ? (
                                    <img src={preview} alt="Bìa truyện" className={cx('imgFull')} />
                                ) : (
                                    <div className={cx('uploadPlaceholder')}>
                                        <AddPhotoAlternateRounded />
                                        <span>Tải lên bìa truyện (Tỉ lệ 3:4)</span>
                                    </div>
                                )}
                                <input type="file" hidden accept="image/*" onChange={(e) => setCover(e.target.files[0])} />
                            </label>
                        </Box>

                        {/* Phần Nội Dung */}
                        <Box className={cx('section')}>
                            <Typography className={cx('sectionLabel')}>2. Thông tin chi tiết</Typography>
                            <Stack spacing={4}>
                                <TextField
                                    fullWidth
                                    label="Tên truyện"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Nhập tên truyện của bạn..."
                                />

                                <Autocomplete
                                    multiple
                                    options={GENRES}
                                    value={selectedGenres}
                                    onChange={(e, v) => setSelectedGenres(v)}
                                    renderTags={(v, getProps) => v.map((tag, i) => (
                                        <Chip label={tag} {...getProps({ i })} className={cx('genreChip')} />
                                    ))}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Thể loại" placeholder="Chọn các thể loại..." />
                                    )}
                                />

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={5}
                                    label="Tóm tắt truyện"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Viết vài dòng giới thiệu ngắn gọn..."
                                />
                            </Stack>
                        </Box>

                        {status.msg && <Alert severity={status.type} sx={{ fontSize: '1.4rem' }}>{status.msg}</Alert>}

                        <Button 
                            className={cx('submitBtn')}
                            disabled={loading}
                            type="submit"
                            startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SendRounded />}
                        >
                            {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG TRUYỆN NGAY'}
                        </Button>
                    </Stack>
                </form>
            </div>
        </div>
    );
}