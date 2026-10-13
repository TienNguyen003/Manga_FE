import classNames from 'classnames/bind';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { COIN_PACKS } from '~/services/coinService';
import { useMembership } from '~/hooks/useMembership';
import { useUser } from '~/providers/UserContext';
import paths from '~/routes/paths';
import styles from './CoinBalanceCard.module.scss';

const cx = classNames.bind(styles);

/**
 * CoinBalanceCard — COIN FOUNDATION (P2)
 *
 * Surfaces the wallet so the pay-per-chapter model is legible: balance, how to
 * earn, and pack pricing. Everything is explicit — the balance never changes
 * without the reader pressing a button, and each pack states its price.
 *
 * ⚠️ Pack "purchase" grants demo coins. No payment provider is contacted.
 */
export default function CoinBalanceCard({ variant = 'full' }) {
  const { wallet, balance, isPremium, isDemoMode, buyPack, earn } = useMembership();
  const { userId } = useUser();
  const [busy, setBusy] = useState(null);

  const handleBuy = (packId) => {
    setBusy(packId);
    const result = buyPack(packId);
    setBusy(null);
    if (result?.ok) {
      toast.success(`+${result.pack.coins.toLocaleString('vi-VN')} Coin (chế độ xem trước).`);
    }
  };

  const handleEarn = () => {
    if (!userId) {
      toast.info('Đăng nhập để nhận Coin hằng ngày.');
      return;
    }
    const result = earn(20, { label: 'Thưởng đọc hằng ngày' });
    if (result.ok) toast.success('+20 Coin thưởng hằng ngày');
  };

  if (variant === 'chip') {
    return (
      <Link to={paths.membership} className={cx('chip')} title="Số dư Coin của bạn">
        <span className={styles.chipIcon}>🪙</span>
        <span className={styles.chipValue}>{(balance || 0).toLocaleString('vi-VN')}</span>
      </Link>
    );
  }

  return (
    <section className={cx('card', { compact: variant === 'compact' })}>
      <header className={styles.head}>
        <div>
          <h3 className={styles.title}>🪙 Ví Coin</h3>
          <p className={styles.sub}>Dùng để mở khóa từng chương Premium</p>
        </div>
        <div className={styles.balanceBox}>
          <span className={styles.balanceLabel}>Số dư</span>
          <span className={styles.balanceValue}>{(balance || 0).toLocaleString('vi-VN')} Coin</span>
        </div>
      </header>

      {isPremium && (
        <p className={styles.premiumNote}>
          👑 Bạn là thành viên Premium — đã mở khóa tất cả chương, không cần dùng Coin.
        </p>
      )}

      <div className={styles.packs}>
        {COIN_PACKS.map((pack) => (
          <button
            key={pack.id}
            type="button"
            className={cx('pack', { popular: pack.popular })}
            onClick={() => handleBuy(pack.id)}
            disabled={busy === pack.id}
          >
            <span className={styles.packCoins}>{pack.coins.toLocaleString('vi-VN')}</span>
            <span className={styles.packHint}>{pack.perChapter} chương</span>
            <span className={styles.packPrice}>{pack.priceLabel}</span>
            {pack.popular && <span className={styles.packTag}>Phổ biến</span>}
          </button>
        ))}
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.earnBtn} onClick={handleEarn}>
          +20 Coin thưởng hằng ngày
        </button>
        <Link to={paths.membership} className={styles.planLink}>
          Xem gói Premium →
        </Link>
      </div>

      {isDemoMode && (
        <p className={styles.demo}>
          ⚠️ Chế độ xem trước: Coin và gói mua hiện chỉ lưu trên thiết bị này. Hệ thống thanh toán chưa được kết nối.
        </p>
      )}

      {wallet?.ledger?.length > 0 && (
        <ul className={styles.ledger}>
          {wallet.ledger.slice(0, 3).map((entry) => (
            <li key={entry.id}>
              <span>{entry.label}</span>
              <span className={entry.type === 'EARN' ? styles.plus : styles.minus}>
                {entry.type === 'EARN' ? '+' : '-'}
                {entry.amount}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
