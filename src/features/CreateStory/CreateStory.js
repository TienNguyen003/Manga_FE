import {
    AutoAwesomeRounded,
    AutoFixHighRounded,
    CloseRounded,
} from '@mui/icons-material';
import StormIcon from '@mui/icons-material/Storm';
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Chip, CircularProgress,
    Container, IconButton,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { comicService } from '~/services/comicService';
import styles from './CreateStory.module.scss';

const cx = classNames.bind(styles);

const GENRES = ['Hành động', 'Hài hước', 'Kinh dị', 'Tình cảm', 'Phiêu lưu', 'Giả tưởng', 'Học đường', 'Trinh thám'];

export default function CreateStory() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [cover, setCover] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });

    useEffect(() => {
        if (!cover) { setPreview(null); return; }
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
            await comicService.createComic(formData);
            setStatus({ type: 'success', msg: 'Vũ trụ của bạn đã được khởi tạo!' });
        } catch {
            setStatus({ type: 'error', msg: 'Năng lượng không đủ, hãy thử lại.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className={cx('pageWrapper')}>
            <Container maxWidth="lg">
                <form onSubmit={handleUpload} className={cx('creativeForm')}>
                    <div className={cx('layout')}>
                        {/* Cột 1: Branding & Visual */}
                        <aside className={cx('visualPanel')}>
                            <div className={cx('branding')}>
                                <StormIcon className={cx('logo')} />
                                <Typography className={cx('label')}>Creator Workspace</Typography>
                            </div>
                            
                            <Typography variant="h1" className={cx('mainTitle')}>
                                New <span>Story</span>
                            </Typography>

                            <Box className={cx('coverSpace')}>
                                <label className={cx('uploadBox', { active: !!preview })}>
                                    {preview ? (
                                        <div className={cx('imageBox')}>
                                            <img src={preview} alt="Story Cover" />
                                            <IconButton className={cx('clearBtn')} onClick={(e) => { e.preventDefault(); setCover(null); }}>
                                                <CloseRounded />
                                            </IconButton>
                                        </div>
                                    ) : (
                                        <div className={cx('inner')}>
                                            <AutoFixHighRounded />
                                            <p>Drop your cover art here</p>
                                        </div>
                                    )}
                                    <input type="file" hidden accept="image/*" onChange={(e) => setCover(e.target.files[0])} />
                                </label>
                            </Box>
                        </aside>

                        {/* Cột 2: Data & Inputs */}
                        <main className={cx('dataPanel')}>
                            <Stack spacing={4}>
                                <div className={cx('fieldGroup')}>
                                    <Typography className={cx('fieldLabel')}>Identity</Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Tên tác phẩm của bạn..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className={cx('neoInput')}
                                    />
                                </div>

                                <div className={cx('fieldGroup')}>
                                    <Typography className={cx('fieldLabel')}>Genre Tags</Typography>
                                    <Autocomplete
                                        multiple
                                        options={GENRES}
                                        value={selectedGenres}
                                        onChange={(e, v) => setSelectedGenres(v)}
                                        renderTags={(v, getProps) => v.map((tag, i) => (
                                            <Chip label={tag} {...getProps({ i })} className={cx('neoChip')} />
                                        ))}
                                        renderInput={(params) => (
                                            <TextField {...params} placeholder="Chọn phong cách..." className={cx('neoInput')} />
                                        )}
                                    />
                                </div>

                                <div className={cx('fieldGroup')}>
                                    <Typography className={cx('fieldLabel')}>The Concept</Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={6}
                                        placeholder="Cốt truyện này nói về điều gì?"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className={cx('neoInput')}
                                    />
                                </div>

                                {status.msg && <Alert severity={status.type} className={cx('alert')}>{status.msg}</Alert>}

                                <Button 
                                    fullWidth
                                    type="submit"
                                    disabled={loading}
                                    className={cx('launchBtn')}
                                    endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeRounded />}
                                >
                                    {loading ? 'Processing...' : 'Launch Project'}
                                </Button>
                            </Stack>
                        </main>
                    </div>
                </form>
            </Container>
        </Box>
    );
}