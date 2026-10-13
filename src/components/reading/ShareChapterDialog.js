import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import shareService, { buildChapterShareUrl, buildShareCard } from '~/services/shareService';
import referralService from '~/services/referralService';
import { useUser } from '~/providers/UserContext';
import styles from './ShareChapterDialog.module.scss';

/**
 * ShareChapterDialog — READER SHARE (P3, growth)
 *
 * Three paths, tried in the order a real user wants them:
 *   1. OS share sheet (mobile) — the highest-converting path
 *   2. Copy link
 *   3. Download a generated share card (canvas, no backend needed)
 *
 * The card is generated client-side; if the cover is cross-origin without CORS
 * headers the canvas is tainted, and we degrade to link-only rather than
 * showing a broken image.
 */
export default function ShareChapterDialog({ open, onClose, manga, chapter, chapterApiData }) {
  const { userId } = useUser();
  const [cardUrl, setCardUrl] = useState(null);
  const [busy, setBusy] = useState(false);

  const title = manga?.name || manga?.mangaName || 'Truyện';
  const chapterName = chapter?.chapter_name || chapter?.chapterName || '';
  const cover = manga?.thumb_url || manga?.thumbnailUrl || chapter?.chapter_path || '';
  const chapterTitle = chapter?.chapter_title || chapter?.chapterTitle || '';

  useEffect(() => {
    if (!open) {
      setCardUrl(null);
      return;
    }
    let cancelled = false;
    buildShareCard({ title, chapterName, cover, chapterTitle }).then((url) => {
      if (!cancelled) setCardUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [open, title, chapterName, cover, chapterTitle]);

  const handleShare = async () => {
    setBusy(true);
    const result = await shareService.shareChapter({ title, chapterName, chapterApiData });
    setBusy(false);
    if (result.via === 'cancelled') return;
    if (result.ok) {
      toast.success(result.via === 'native' ? 'Đã chia sẻ' : 'Đã sao chép liên kết chương');
    } else {
      toast.error('Không chia sẻ được. Bạn có thể copy liên kết thủ công.');
    }
  };

  const handleCopy = async () => {
    const url = buildChapterShareUrl({ slug: manga?.slug || manga?.mangaPath, chapterApiData });
    const ok = await shareService.copyToClipboard(url);
    if (ok) toast.success('Đã sao chép liên kết');
    else toast.error('Trình duyệt chặn sao chép. Hãy copy thủ công.');
  };

  const handleDownload = () => {
    if (!cardUrl) {
      toast.info('Ảnh bìa chưa tải được — hãy dùng sao chép liên kết.');
      return;
    }
    const a = document.createElement('a');
    a.href = cardUrl;
    a.download = `${title}-chapter-${chapterName || '1'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const referral = userId ? referralService.getShareText(userId) : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ className: styles.paper }}>
      <DialogTitle className={styles.title}>Chia sẻ chương này</DialogTitle>

      <DialogContent className={styles.body}>
        {cardUrl ? (
          <img src={cardUrl} alt="Ảnh chia sẻ" className={styles.card} />
        ) : (
          <div className={styles.cardFallback}>
            <span className={styles.fallbackTitle}>{title}</span>
            {chapterName && <span className={styles.fallbackChapter}>Chương {chapterName}</span>}
            <span className={styles.fallbackNote}>Ảnh bìa chưa tải được — vẫn chia sẻ bằng liên kết.</span>
          </div>
        )}

        <p className={styles.preview}>
          {title}
          {chapterName ? ` — Chương ${chapterName}` : ''}
        </p>

        {referral && <p className={styles.referral}>Mời bạn bè: mã <strong>{referral.link.split('ref=')[1]}</strong></p>}
      </DialogContent>

      <DialogActions className={styles.actions}>
        <Button onClick={handleCopy} className={styles.secondary}>
          Sao chép liên kết
        </Button>
        <Button onClick={handleDownload} className={styles.secondary} disabled={!cardUrl}>
          Tải ảnh
        </Button>
        <Button variant="contained" onClick={handleShare} disabled={busy} className={styles.primary}>
          {busy ? 'Đang chia sẻ...' : 'Chia sẻ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
