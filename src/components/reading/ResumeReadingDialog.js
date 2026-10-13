import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useReadingProgress } from '~/hooks/useReadingProgress';
import { encodeChapterApiData } from '~/services/shareService';
import { timeAgo } from '~/lib/date';
import paths from '~/routes/paths';
import styles from './ResumeReadingDialog.module.scss';

/**
 * ResumeReadingDialog — SMART READING RESUME (P0)
 *
 * Three states, matching the product spec:
 *   1. "Continue where you left off?"  -> resume at the saved page
 *   2. "Chapter completed"             -> offer the next chapter
 *   3. "New chapter available"         -> offer the newest chapter
 *
 * It is deliberately a *choice*, not an auto-redirect: a reader who wants to
 * re-read from the top must be able to say so in one tap.
 */
export default function ResumeReadingDialog({
  open,
  onClose,
  mangaPath,
  chapterName,
  currentPage = 0,
  totalPages = 0,
  percent = 0,
  readAt = null,
  completed = false,
  nextChapter = null,
  hasNewChapter = false,
  latestChapter = null,
  chapterApiData = null,
}) {
  const navigate = useNavigate();
  const { chapterProgress } = useReadingProgress(mangaPath, chapterName);
  const [remember, setRemember] = useState(true);

  const page = chapterProgress?.currentPage ?? currentPage;
  const pages = chapterProgress?.totalPages ?? totalPages;
  const pct = chapterProgress?.percent ?? percent;
  const stamp = chapterProgress?.lastReadAt ?? readAt;

  useEffect(() => {
    if (!open) return;
    setRemember(true);
  }, [open]);

  const goTo = (chapter, { page = 0 } = {}) => {
    if (!chapter) return;
    const apiData = chapter.chapterApiData || (chapter.chapterName === chapterName ? chapterApiData : null);
    const query = new URLSearchParams({ slug: mangaPath || '' });
    if (apiData) query.set('id', encodeChapterApiData(apiData));
    if (chapter.chapterName) query.set('chapter', chapter.chapterName);
    // Carry the saved page so the reader jumps straight there. Without this the
    // reader would re-open the resume prompt and we would loop forever.
    if (page > 1) query.set('page', String(page));
    onClose?.();
    navigate(`${paths.chapterDetail}?${query.toString()}`);
  };

  const startOver = () => {
    const query = new URLSearchParams({ slug: mangaPath || '' });
    if (chapterApiData) query.set('id', encodeChapterApiData(chapterApiData));
    query.set('restart', '1');
    onClose?.();
    navigate(`${paths.chapterDetail}?${query.toString()}`);
  };

  const status = completed
    ? { icon: '✅', title: 'Chương đã đọc xong', tone: 'done' }
    : hasNewChapter
      ? { icon: '🆕', title: 'Đã có chương mới!', tone: 'new' }
      : { icon: '📖', title: 'Tiếp tục chỗ bạn đang đọc?', tone: 'resume' };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ className: styles.paper }}>
      <DialogTitle className={styles.title}>
        <span className={styles.icon}>{status.icon}</span>
        {status.title}
      </DialogTitle>

      <DialogContent className={styles.body}>
        <p className={styles.chapter}>Chương {chapterName}</p>

        {pages > 0 && !completed && (
          <>
            <p className={styles.pages}>
              Trang {page} / {pages}
            </p>
            <div className={styles.track}>
              <div className={styles.fill} style={{ width: `${Math.max(2, pct)}%` }} />
            </div>
            <p className={styles.meta}>
              Bạn đã đọc {pct}%{stamp ? ` · ${timeAgo(stamp)}` : ''}
            </p>
          </>
        )}

        {completed && nextChapter && (
          <p className={styles.meta}>Sẵn sàng sang chương {nextChapter.chapterName}?</p>
        )}

        {hasNewChapter && latestChapter && !completed && (
          <p className={styles.meta}>
            Chương {latestChapter} vừa được cập nhật.
          </p>
        )}

        <label className={styles.remember}>
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Hỏi lại lần sau
        </label>
      </DialogContent>

      <DialogActions className={styles.actions}>
        <Button onClick={startOver} className={styles.secondary}>
          Đọc lại từ đầu
        </Button>

        {completed && nextChapter ? (
          <Button variant="contained" onClick={() => goTo(nextChapter)} className={styles.primary}>
            Sang chương {nextChapter.chapterName}
          </Button>
        ) : hasNewChapter && latestChapter ? (
          <Button variant="contained" onClick={() => goTo(latestChapter)} className={styles.primary}>
            Đọc chương {latestChapter.chapterName}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={() => goTo({ chapterName, chapterApiData }, { page })}
            className={styles.primary}
          >
            Tiếp tục
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
