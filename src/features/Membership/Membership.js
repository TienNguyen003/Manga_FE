import classNames from 'classnames/bind';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import CoinBalanceCard from '~/components/monetization/CoinBalanceCard';
import { useMembership } from '~/hooks/useMembership';
import { useUser } from '~/providers/UserContext';
import { PREMIUM_BENEFITS } from '~/services/membershipService';
import { copyToClipboard } from '~/services/shareService';
import referralService from '~/services/referralService';
import paths from '~/routes/paths';
import styles from './Membership.module.scss';

const cx = classNames.bind(styles);

/**
 * Membership — PREMIUM MEMBERSHIP PAGE (P2)
 *
 * Frontend-only foundation. Rules this page keeps:
 *   - both plans and their prices are shown side by side, always
 *   - the current plan is stated explicitly
 *   - a visible notice says payment is not connected, so the demo state can
 *     never be mistaken for a real charge
 */
export default function Membership() {
  const { plans, plan, isPremium, isDemoMode, membership, upgrade, cancel } = useMembership();
  const { userId } = useUser();
  const [busy, setBusy] = useState(false);
  const referral = userId ? referralService.getReferral(userId) : null;

  const handleUpgrade = () => {
    if (!userId) {
      toast.info('Đăng nhập để nâng cấp Premium.');
      return;
    }
    setBusy(true);
    upgrade();
    setBusy(false);
    toast.success(isDemoMode ? 'Đã bật Premium (xem trước — chưa có thanh toán).' : 'Đã nâng cấp Premium.');
  };

  const handleCancel = () => {
    setBusy(true);
    cancel();
    setBusy(false);
    toast.info('Đã hạ cấp về gói Miễn phí.');
  };

  const handleCopyReferral = async () => {
    const ok = await copyToClipboard(referral.link);
    if (ok) toast.success('Đã sao chép liên kết giới thiệu');
    else toast.error('Trình duyệt chặn sao chép. Hãy copy thủ công.');
  };


  return (
    <main className={cx('page', 'container-fluid')}>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <span className={styles.kicker}>Thành viên</span>
          <h1 className={styles.title}>
            Đọc nhiều hơn, <span>ít gián đoạn hơn</span>
          </h1>
          <p className={styles.sub}>
            Premium mở khóa toàn bộ chương Premium, xem chương sớm và đọc không quảng cáo.
          </p>
        </header>

        {isDemoMode && (
          <div className={styles.demoBanner} role="status">
            ⚠️ <strong>Chế độ xem trước.</strong> Cổng thanh toán chưa được kết nối. Thay đổi gói dưới đây chỉ lưu trên thiết bị
            này và không có hóa đơn nào được tạo.
          </div>
        )}

        <section className={styles.currentPlan}>
          <div>
            <span className={styles.currentLabel}>Gói hiện tại</span>
            <strong className={styles.currentName}>
              {isPremium ? '👑 PREMIUM' : 'FREE'}
              <span className={styles.currentSince}>
                {isPremium && membership?.renewsAt
                  ? ` · đến ${new Date(membership.renewsAt).toLocaleDateString('vi-VN')}`
                  : ' · mặc định'}
              </span>
            </strong>
          </div>
          {isPremium ? (
            <button type="button" className={cx('btn', 'ghost')} onClick={handleCancel} disabled={busy}>
              Hạ cấp về Free
            </button>
          ) : (
            <button type="button" className={cx('btn', 'primary')} onClick={handleUpgrade} disabled={busy}>
              {busy ? 'Đang xử lý...' : 'Nâng cấp ngay'}
            </button>
          )}
        </section>

        <section className={styles.plans}>
          {plans.map((p) => {
            const active = p.id === plan.id;
            return (
              <article key={p.id} className={cx('plan', { popular: p.popular, active })}>
                {p.popular && <span className={styles.planTag}>Phổ biến nhất</span>}
                <h2 className={styles.planName}>{p.name}</h2>
                <div className={styles.price}>
                  <span className={styles.amount}>{p.priceLabel}</span>
                  {p.period && <span className={styles.period}>{p.period}</span>}
                </div>
                <p className={styles.tagline}>{p.tagline}</p>

                <ul className={styles.features}>
                  {p.features.map((f) => (
                    <li key={f.label} className={f.included ? styles.yes : styles.no}>
                      {f.included ? '✓' : '✕'} {f.label}
                    </li>
                  ))}
                </ul>

                {active ? (
                  <button type="button" className={cx('btn', 'muted')} disabled>
                    Gói hiện tại
                  </button>
                ) : p.id === 'premium' ? (
                  <button type="button" className={cx('btn', 'primary')} onClick={handleUpgrade} disabled={busy}>
                    {busy ? 'Đang xử lý...' : `Nâng cấp ${p.priceLabel}`}
                  </button>
                ) : (
                  <button type="button" className={cx('btn', 'ghost')} onClick={handleCancel} disabled={busy}>
                    Chuyển về Free
                  </button>
                )}
              </article>
            );
          })}
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Quyền lợi Premium</h2>
          <div className={styles.perks}>
            {PREMIUM_BENEFITS.map((b) => (
              <div key={b.id} className={styles.perk}>
                <span className={styles.perkIcon}>{b.icon}</span>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </section>

        <CoinBalanceCard />

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Mời bạn bè</h2>
          {userId ? (
            <div className={styles.referral}>
              <p className={styles.referralText}>
                Chia sẻ liên kết của bạn — bạn bè đăng ký sẽ giúp bạn nhận thêm Coin và thời gian Premium.
              </p>
              <code className={styles.referralCode}>{referral.link}</code>
              <button type="button" className={cx('btn', 'ghost')} onClick={handleCopyReferral}>
                Sao chép liên kết
              </button>
            </div>
          ) : (
            <p className={styles.blockNote}>
              <Link to={paths.login}>Đăng nhập</Link> để nhận mã giới thiệu riêng.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
