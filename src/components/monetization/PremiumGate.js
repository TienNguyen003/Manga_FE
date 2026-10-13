/**
 * PremiumGate — the paywall / upgrade modal (Rule 5)
 *
 * ⚠️ EVERY VALUE SHOWN COMES FROM THE SERVER. The reader opens this modal with
 * `accessType` and `price` taken from the `403 PAYWALL_LOCKED` payload, and
 * unlocking calls the real `POST /wallet/unlock-chapter`. The component never
 * derives a price of its own — a client-computed price would let anyone open a
 * paid chapter for free.
 *
 * Honesty rules this modal enforces:
 *   - the cost is always visible before any action
 *   - "maybe later" always exists and is never guilt-tripped
 *   - ⚠️ NO PAYMENT GATEWAY is connected, so topping up coins and subscribing to
 *     Premium are labelled as SIMULATED — never shown as a real purchase, and
 *     never rendered with a real VND/USD amount.
 */
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useMembership } from '~/hooks/useMembership';
import { useUser } from '~/providers/UserContext';
import { TOPUP_IS_SIMULATED } from '~/services/coinService';
import paths from '~/routes/paths';
import styles from './PremiumGate.module.scss';

const ACCESS_EARLY = 'EARLY_ACCESS';

export default function PremiumGate({
  open,
  onClose,
  busy = false,
  mangaPath,
  chapterName,
  chapterIndex = 0,
  totalChapters = 0,
  accessType = 'PREMIUM',
  price = 0,
  onUnlock,
  onUnlocked,
}) {
  const { balance, isPremium } = useMembership();
  const { userId } = useUser();
  const [error, setError] = useState('');

  const cost = Number(price) || 0;
  const isEarly = accessType === ACCESS_EARLY;
  const shortfall = Math.max(0, cost - (balance || 0));
  const canAfford = !isEarly && cost > 0 && shortfall <= 0;

  const handleUnlock = async () => {
    setError('');
    if (!userId) {
      onClose?.();
      toast.info('Đăng nhập để mở khóa chương.');
      return;
    }
    try {
      await onUnlock?.();
      onUnlocked?.();
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Không mở khóa được chương này. Vui lòng thử lại.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ className: styles.paper }}>
      <DialogTitle className={styles.title}>
        <span className={styles.titleIcon}>{isEarly ? '⏩' : '💎'}</span>
        {isEarly ? 'Chương xem trước' : 'Chương Premium'}
      </DialogTitle>

      <DialogContent className={styles.body}>
        <p className={styles.chapter}>
          Chương {chapterName}
          {totalChapters > 0 ? ` · trong tổng ${totalChapters} chương` : ''}
        </p>

        <p className={styles.desc}>
          {isEarly
            ? 'Chương này dành cho thành viên Premium đọc sớm. Nâng cấp để đọc ngay.'
            : `Mở khóa chương này với ${cost} Coin, hoặc nâng cấp Premium để đọc không giới hạn.`}
        </p>

        <ul className={styles.perks}>
          <li>✓ Đọc không quảng cáo</li>
          <li>✓ Xem chương sớm</li>
          <li>✓ Mở khóa chương Premium bằng Coin</li>
          <li>✓ Cài đặt trình đọc nâng cao</li>
        </ul>

        {!isEarly && (
          <div className={styles.coinBox}>
            <div className={styles.coinRow}>
              <span>Số dư</span>
              <strong>{(balance || 0).toLocaleString('vi-VN')} Coin</strong>
            </div>
            <div className={styles.coinRow}>
              <span>Giá mở khóa</span>
              <strong>{cost.toLocaleString('vi-VN')} Coin</strong>
            </div>
            {error && <p className={styles.error}>{error}</p>}
          </div>
        )}

        {isPremium && !isEarly && <p className={styles.note}>Bạn đang là thành viên Premium — chương này đã mở sẵn.</p>}

        {/* ⚠️ No payment gateway: say so instead of implying a real charge. */}
        {TOPUP_IS_SIMULATED && (
          <p className={styles.note}>
            ⚠️ Chế độ mô phỏng: hệ thống thanh toán chưa được kết nối. Coin là ảo và không
            có khoản thanh toán VND nào được thực hiện.
          </p>
        )}
      </DialogContent>

      <DialogActions className={styles.actions}>
        <Button onClick={onClose} className={styles.ghost}>
          Để sau
        </Button>

        {!isEarly && !isPremium && (
          <Button
            onClick={handleUnlock}
            disabled={busy || !canAfford}
            className={styles.secondary}
            title={canAfford ? undefined : 'Bạn không đủ Coin, hãy nạp thêm'}
          >
            {busy ? 'Đang xử lý...' : 'Mở khóa bằng Coin'}
          </Button>
        )}

        {isPremium && (
          <Button variant="contained" onClick={onClose} className={styles.primary}>
            Đọc tiếp
          </Button>
        )}

        {!isEarly && shortfall > 0 && !isPremium && (
          <Link to={paths.membership} className={styles.buyLink}>
            Thiếu {shortfall.toLocaleString('vi-VN')} Coin — xem trang nạp
          </Link>
        )}
      </DialogActions>

      {!userId && (
        <div className={styles.signin}>
          <Link to={paths.login}>Đăng nhập</Link> để theo dõi và nhận thông báo chương mới.
        </div>
      )}
    </Dialog>
  );
}

