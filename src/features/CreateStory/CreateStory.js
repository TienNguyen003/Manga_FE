import { AddRounded, AutoAwesomeRounded, AutoFixHighRounded, DeleteOutlineRounded, CloseRounded } from '@mui/icons-material';
import StormIcon from '@mui/icons-material/Storm';
import { Alert, Autocomplete, Box, Button, Chip, CircularProgress, Container, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { comicService } from '~/services/comicService';
import styles from './CreateStory.module.scss';

const cx = classNames.bind(styles);

const GENRES = ['Hành động', 'Hài hước', 'Kinh dị', 'Tình cảm', 'Phiêu lưu', 'Giả tưởng', 'Học đường', 'Trinh thám'];

export default function CreateStory() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const comicId = queryParams.get('comicId');
  const isEditMode = Boolean(comicId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [cover, setCover] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!cover) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(cover);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [cover]);

  useEffect(() => {
    const loadComicDetail = async () => {
      if (!comicId) return;

      setLoadingDetail(true);
      try {
        const response = await comicService.getComic(comicId);
        const comic = response?.result || response?.data || response || {};

        setTitle(comic.title || '');
        setDescription(comic.description || '');
        if (Array.isArray(comic.genres)) {
          setSelectedGenres(comic.genres);
        } else if (typeof comic.genre === 'string') {
          setSelectedGenres(
            comic.genre
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
          );
        }

        if (comic.cover) {
          const imgBase = process.env.REACT_APP_IMAGE_BASE_URL || '';
          setPreview(`${imgBase}${comic.cover}`);
        }

        const chapterData = Array.isArray(comic.chapters) ? comic.chapters : Array.isArray(comic.chapterList) ? comic.chapterList : [];

        setChapters(
          chapterData.map((chapter, index) => ({
            id: chapter.id || chapter.chapterId || `chapter-${index}`,
            title: chapter.title || chapter.name || chapter.chapterName || `Chương ${index + 1}`,
            content: chapter.content || chapter.text || chapter.body || '',
          })),
        );
      } catch {
        setStatus({ type: 'error', msg: 'Không tải được dữ liệu truyện để chỉnh sửa.' });
      } finally {
        setLoadingDetail(false);
      }
    };

    loadComicDetail();
  }, [comicId]);

  const handleChapterChange = (index, field, value) => {
    setChapters((prev) => prev.map((chapter, chapterIndex) => (chapterIndex === index ? { ...chapter, [field]: value } : chapter)));
  };

  const handleAddChapter = () => {
    setChapters((prev) => [
      ...prev,
      {
        id: `chapter-${Date.now()}`,
        title: `Chương ${prev.length + 1}`,
        content: '',
      },
    ]);
  };

  const handleRemoveChapter = (index) => {
    setChapters((prev) => prev.filter((_, chapterIndex) => chapterIndex !== index));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setStatus({ type: 'error', msg: 'Vui lòng nhập tên truyện.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', msg: '' });
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('genres', JSON.stringify(selectedGenres));
      formData.append(
        'chapters',
        JSON.stringify(
          chapters
            .map((chapter, index) => ({
              id: chapter.id,
              title: chapter.title?.trim() || `Chương ${index + 1}`,
              content: chapter.content || '',
            }))
            .filter((chapter) => chapter.title || chapter.content),
        ),
      );
      if (cover) {
        formData.append('cover', cover);
      }

      if (isEditMode) {
        await comicService.updateComic(comicId, formData);
        setStatus({ type: 'success', msg: 'Đã cập nhật truyện và chapter thành công!' });
      } else {
        await comicService.createComic(formData);
        setStatus({ type: 'success', msg: 'Vũ trụ của bạn đã được khởi tạo!' });
      }
    } catch {
      setStatus({ type: 'error', msg: isEditMode ? 'Không thể cập nhật truyện. Vui lòng thử lại.' : 'Năng lượng không đủ, hãy thử lại.' });
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
                {isEditMode ? 'Edit' : 'New'} <span>Story</span>
              </Typography>

              <Box className={cx('coverSpace')}>
                <label className={cx('uploadBox', { active: !!preview })}>
                  {preview ? (
                    <div className={cx('imageBox')}>
                      <img src={preview} alt="Story Cover" />
                      <IconButton
                        className={cx('clearBtn')}
                        onClick={(e) => {
                          e.preventDefault();
                          setCover(null);
                        }}
                      >
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
                  <TextField fullWidth placeholder="Tên tác phẩm của bạn..." value={title} onChange={(e) => setTitle(e.target.value)} className={cx('neoInput')} />
                </div>

                {isEditMode && (
                  <div className={cx('fieldGroup')}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography className={cx('fieldLabel')}>Chapters</Typography>
                      <Button type="button" size="small" startIcon={<AddRounded />} onClick={handleAddChapter} className={cx('chapterAddBtn')}>
                        Thêm chapter
                      </Button>
                    </Stack>

                    <Stack spacing={1.5}>
                      {chapters.length === 0 && (
                        <Paper className={cx('chapterEmpty')} elevation={0}>
                          Chưa có chapter. Nhấn "Thêm chapter" để tạo mới.
                        </Paper>
                      )}

                      {chapters.map((chapter, index) => (
                        <Paper key={chapter.id || index} className={cx('chapterItem')} elevation={0}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography className={cx('chapterIndex')}>Chapter {index + 1}</Typography>
                            <IconButton type="button" size="small" className={cx('chapterDeleteBtn')} onClick={() => handleRemoveChapter(index)}>
                              <DeleteOutlineRounded />
                            </IconButton>
                          </Stack>

                          <TextField
                            fullWidth
                            placeholder="Tên chapter"
                            className={cx('neoInput')}
                            value={chapter.title}
                            onChange={(e) => handleChapterChange(index, 'title', e.target.value)}
                            sx={{ mb: 1.5 }}
                          />
                          <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            placeholder="Nội dung chapter"
                            className={cx('neoInput')}
                            value={chapter.content}
                            onChange={(e) => handleChapterChange(index, 'content', e.target.value)}
                          />
                        </Paper>
                      ))}
                    </Stack>
                  </div>
                )}

                <div className={cx('fieldGroup')}>
                  <Typography className={cx('fieldLabel')}>Genre Tags</Typography>
                  <Autocomplete
                    multiple
                    options={GENRES}
                    value={selectedGenres}
                    onChange={(e, v) => setSelectedGenres(v)}
                    renderTags={(v, getProps) => v.map((tag, i) => <Chip label={tag} {...getProps({ i })} className={cx('neoChip')} />)}
                    renderInput={(params) => <TextField {...params} placeholder="Chọn phong cách..." className={cx('neoInput')} />}
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

                {status.msg && (
                  <Alert severity={status.type} className={cx('alert')}>
                    {status.msg}
                  </Alert>
                )}

                {loadingDetail && isEditMode && (
                  <Alert severity="info" className={cx('alert')}>
                    Đang tải dữ liệu truyện...
                  </Alert>
                )}

                <Button
                  fullWidth
                  type="submit"
                  disabled={loading}
                  className={cx('launchBtn')}
                  endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeRounded />}
                >
                  {loading ? 'Processing...' : isEditMode ? 'Update Project' : 'Launch Project'}
                </Button>
              </Stack>
            </main>
          </div>
        </form>
      </Container>
    </Box>
  );
}
