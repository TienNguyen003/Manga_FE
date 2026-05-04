import { AddRounded, AutoAwesomeRounded, CloudUploadRounded, CloseRounded, DeleteOutlineRounded, RocketLaunchRounded, SaveRounded } from '@mui/icons-material';
import { Alert, Autocomplete, Box, Button, Chip, CircularProgress, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { comicService } from '~/services/comicService';
import styles from './CreateStory.module.scss';

const cx = classNames.bind(styles);
const GENRES = ['Hành động', 'Hài hước', 'Kinh dị', 'Tình cảm', 'Phiêu lưu', 'Giả tưởng', 'Học đường', 'Trinh thám'];

export default function CreateStory() {
  const location = useLocation();
  const comicId = new URLSearchParams(location.search).get('comicId');
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
    setPreview(URL.createObjectURL(cover));
  }, [cover]);

  useEffect(() => {
    if (!comicId) return;
    setLoadingDetail(true);
    comicService
      .getComic(comicId)
      .then((res) => {
        const comic = res?.result || res?.data || res || {};
        setTitle(comic.title || '');
        setDescription(comic.description || '');
        if (Array.isArray(comic.genres)) setSelectedGenres(comic.genres);
        else if (typeof comic.genre === 'string')
          setSelectedGenres(
            comic.genre
              .split(',')
              .map((i) => i.trim())
              .filter(Boolean),
          );
        if (comic.cover) setPreview(`${process.env.REACT_APP_IMAGE_BASE_URL || ''}${comic.cover}`);
        const data = Array.isArray(comic.chapters) ? comic.chapters : Array.isArray(comic.chapterList) ? comic.chapterList : [];
        setChapters(data.map((ch, i) => ({ id: ch.id || ch.chapterId || `ch-${i}`, title: ch.title || ch.name || `Chương ${i + 1}`, content: ch.content || ch.text || '' })));
      })
      .catch(() => setStatus({ type: 'error', msg: 'Lỗi tải dữ liệu.' }))
      .finally(() => setLoadingDetail(false));
  }, [comicId]);

  const handleChapterChange = (index, field, value) => setChapters((prev) => prev.map((ch, i) => (i === index ? { ...ch, [field]: value } : ch)));
  const handleAddChapter = () => setChapters((prev) => [...prev, { id: `ch-${Date.now()}`, title: `Chương ${prev.length + 1}`, content: '' }]);
  const handleRemoveChapter = (index) => setChapters((prev) => prev.filter((_, i) => i !== index));

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setStatus({ type: 'error', msg: 'Vui lòng nhập tên truyện!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setLoading(true);
    setStatus({ type: '', msg: '' });
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      fd.append('genres', JSON.stringify(selectedGenres));
      fd.append(
        'chapters',
        JSON.stringify(chapters.map((ch, i) => ({ id: ch.id, title: ch.title?.trim() || `Chương ${i + 1}`, content: ch.content || '' })).filter((c) => c.title || c.content)),
      );
      if (cover) fd.append('cover', cover);
      if (isEditMode) {
        await comicService.updateComic(comicId, fd);
        setStatus({ type: 'success', msg: 'Cập nhật thành công!' });
      } else {
        await comicService.createComic(fd);
        setStatus({ type: 'success', msg: 'Khởi tạo thành công!' });
      }
    } catch {
      setStatus({ type: 'error', msg: 'Lỗi hệ thống.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className={cx('pageWrapper')}>
      {/* THANH ACTION BAR STICKY */}
      <div className={cx('topBar')}>
        <div className={cx('inner')}>
          <div className={cx('projectMeta')}>
            <RocketLaunchRounded /> <span>{isEditMode ? 'Chỉnh sửa dự án' : 'Dự án mới'}</span>
          </div>
          <div className={cx('actions')}>
            <Button type="button" startIcon={<SaveRounded />} className={cx('outlineBtn')}>
              Lưu nháp
            </Button>
            <Button
              type="submit"
              form="studio-form"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeRounded />}
              disabled={loading}
              className={cx('solidBtn')}
            >
              {isEditMode ? 'Cập nhật' : 'Công bố'}
            </Button>
          </div>
        </div>
      </div>

      <form id="studio-form" onSubmit={handleUpload} className={cx('studioLayout')}>
        {/* CỘT TRÁI: VISUAL & CONFIG */}
        <aside className={cx('visualPanel')}>
          <label className={cx('coverUploader', { hasImage: !!preview })}>
            {preview ? (
              <>
                <img src={preview} alt="Cover" className={cx('coverImage')} />
                <IconButton
                  className={cx('clearCoverBtn')}
                  onClick={(e) => {
                    e.preventDefault();
                    setCover(null);
                  }}
                >
                  <CloseRounded />
                </IconButton>
              </>
            ) : (
              <div className={cx('uploadPlaceholder')}>
                <CloudUploadRounded className={cx('uploadIcon')} /> <p>Cover Art</p> <span>Tỉ lệ 3:4 khuyến nghị</span>
              </div>
            )}
            <input type="file" hidden accept="image/*" onChange={(e) => setCover(e.target.files[0])} />
          </label>

          <div className={cx('genreBox')}>
            <span className={cx('boxLabel')}>Thể loại</span>
            <Autocomplete
              multiple
              options={GENRES}
              value={selectedGenres}
              onChange={(e, v) => setSelectedGenres(v)}
              renderTags={(v, getProps) => v.map((tag, i) => <Chip label={tag} {...getProps({ i })} className={cx('neoChip')} size="small" />)}
              renderInput={(params) => <TextField {...params} placeholder="Chọn thể loại..." className={cx('neoInput')} />}
            />
          </div>
        </aside>

        {/* CỘT PHẢI: BẢN THẢO */}
        <main className={cx('manuscript')}>
          {status.msg && (
            <Alert severity={status.type} className={cx('statusAlert')} icon={false}>
              {status.msg}
            </Alert>
          )}
          {loadingDetail && (
            <Alert severity="info" className={cx('statusAlert')} icon={false}>
              Đang tải dữ liệu...
            </Alert>
          )}

          <TextField fullWidth placeholder="Tên tựa truyện của bạn..." value={title} onChange={(e) => setTitle(e.target.value)} className={cx('neoInput', 'titleInput')} />

          <TextField
            fullWidth
            multiline
            rows={5}
            placeholder="Mô tả ngắn gọn cốt truyện, thu hút người đọc bằng vài câu..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={cx('neoInput')}
          />

          {isEditMode && (
            <div className={cx('chapterSection')}>
              <div className={cx('chapterHeader')}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Chương truyện
                </Typography>
                <Button type="button" size="small" startIcon={<AddRounded />} onClick={handleAddChapter} className={cx('addChapterBtn')}>
                  Thêm chương
                </Button>
              </div>
              <div className={cx('chapterList')}>
                {chapters.length === 0 && (
                  <Paper className={cx('chapterEmpty')} elevation={0}>
                    Chưa có chương nào.
                  </Paper>
                )}
                {chapters.map((chapter, index) => (
                  <Paper key={chapter.id || index} className={cx('chapterItem')} elevation={0}>
                    <span className={cx('chapterIndex')}>Chương {index + 1}</span>
                    <IconButton type="button" size="small" className={cx('chapterDeleteBtn')} onClick={() => handleRemoveChapter(index)}>
                      <DeleteOutlineRounded />
                    </IconButton>
                    <TextField
                      fullWidth
                      placeholder="Tên chương..."
                      className={cx('neoInput')}
                      value={chapter.title}
                      onChange={(e) => handleChapterChange(index, 'title', e.target.value)}
                      sx={{ mb: 1.5 }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      placeholder="Nội dung..."
                      className={cx('neoInput')}
                      value={chapter.content}
                      onChange={(e) => handleChapterChange(index, 'content', e.target.value)}
                    />
                  </Paper>
                ))}
              </div>
            </div>
          )}
        </main>
      </form>
    </Box>
  );
}
