import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';

import { unwrapList } from '~/lib/httpRequest';
import { adminService } from '~/services/adminService';
import { useMembership } from '~/hooks/useMembership';
import styles from './AdSlot.module.scss';

const cx = classNames.bind(styles);

const localDateTime = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  );
};

/**
 * AdSlot — the single place the product decides whether an ad is rendered.
 *
 * WHY IT EXISTS
 * -------------
 * The Reader previously rendered two hard-coded <img> banners fed by
 * `/admin/ads`. That made "Premium = ad-free" impossible to implement without
 * hunting down every banner in the codebase.
 *
 * Contract:
 *   - Premium member  -> renders NOTHING (ad-free is a real, visible benefit)
 *   - Free member     -> renders the ad from the REAL `/admin/ads` API
 *   - Ad API failure  -> renders a labelled placeholder in dev so the layout
 *                        does not silently collapse
 *
 * No ad network / third-party script is embedded. The backend keeps owning
 * creative, targeting and endAt scheduling; this only decides *visibility*.
 */
export default function AdSlot({
  /** Pre-resolved ad object — lets the Reader keep its single batched fetch. */
  ad,
  /** Or let the slot resolve it itself. */
  targetUrl,
  slot = 'inline',
  label = 'Quảng cáo',
  fallback = true,
}) {
  const { isPremium, isLoading: membershipLoading } = useMembership();
  const [resolved, setResolved] = useState(ad || null);
  const [attempted, setAttempted] = useState(Boolean(ad));

  useEffect(() => {
    setResolved(ad || null);
    setAttempted(Boolean(ad));
  }, [ad]);

  useEffect(() => {
    if (ad || !targetUrl || isPremium) return;
    let cancelled = false;

    adminService
      // ✅ Public endpoint — no token required (Rule 5).
      .getAds({ targetUrl, endAt: localDateTime() })
      .then(({ data }) => {
        if (cancelled) return;
        setResolved(unwrapList({ data })[0] || null);
      })
      .catch(() => {
        if (!cancelled) setResolved(null);
      })
      .finally(() => {
        if (!cancelled) setAttempted(true);
      });
    return () => {
      cancelled = true;
    };
  }, [ad, targetUrl, isPremium]);

  // Fire the impression ONCE per rendered ad (Rule 5). Never on the server-read
  // fetch — only when the creative is actually shown to a free reader.
  useEffect(() => {
    if (!resolved?.id || isPremium) return undefined;
    adminService.trackAdImpression(resolved.id).catch(() => {});
    return undefined;
  }, [resolved?.id, isPremium]);

  /** Report the click, then let the browser follow the link. */
  const handleAdClick = () => {
    if (resolved?.id) adminService.trackAdClick(resolved.id).catch(() => {});
  };

  // Premium, or membership still resolving: never flash an ad.
  if (isPremium || membershipLoading) return null;

  if (resolved?.imageUrl) {
    return (
      <aside className={cx('slot', slot)} aria-label={label}>
        <span className={cx('tag')}>{label}</span>
        <a href={resolved.linkUrl || resolved.url || '#'} target="_blank" rel="noopener noreferrer" onClick={handleAdClick}>
          <img src={resolved.imageUrl} alt={resolved.title || label} loading="lazy" />
        </a>
      </aside>
    );
  }

  if (!fallback || !attempted) return null;

  return (
    <aside className={cx('slot', slot, 'placeholder')} aria-label={label}>
      <span className={cx('tag')}>{label}</span>
      <div className={cx('box')}>
        <span>Miễn phí — nâng cấp Premium để xem truyện không quảng cáo</span>
      </div>
    </aside>
  );
}
