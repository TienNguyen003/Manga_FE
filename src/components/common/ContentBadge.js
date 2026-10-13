import classNames from 'classnames/bind';
import { LockRounded } from '@mui/icons-material';

import { ACCESS_META, ACCESS_FREE, ACCESS_PREMIUM, ACCESS_EARLY } from '~/services/contentAccessService';
import styles from './ContentBadge.module.scss';

const cx = classNames.bind(styles);

/**
 * ContentBadge — the single visual vocabulary for the access model.
 *
 * Every surface (comic card, chapter row, reader dropdown, search result)
 * renders access state through this one component, so FREE / PREMIUM /
 * EARLY ACCESS can never drift between screens. It deliberately shows the
 * *price* next to the lock — access is never a surprise at click time.
 */
export default function ContentBadge({ type = ACCESS_FREE, price = 0, size = 'md', showPrice = true }) {
  const meta = ACCESS_META[type] || ACCESS_META[ACCESS_FREE];
  if (type === ACCESS_FREE) return null;

  const label =
    type === ACCESS_PREMIUM && showPrice && price ? `${meta.icon} ${price} Coin` : `${meta.icon} ${meta.shortLabel}`;

  return (
    <span className={cx('badge', meta.tone, size)} title={meta.label}>
      {type !== ACCESS_PREMIUM && <LockRounded className={cx('lock')} />}
      {label}
    </span>
  );
}

export const isPaidAccess = (type) => type === ACCESS_PREMIUM || type === ACCESS_EARLY;
