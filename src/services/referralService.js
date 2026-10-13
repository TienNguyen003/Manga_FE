/**
 * REFERRAL — data source: MOCK (localStorage)
 *
 * ⚠️ No backend referral system exists. This builds the flow + copy + link
 * shape only. The code is generated locally (it doubles as the invite code)
 * so the UI is complete, but NOTHING is tracked server-side and no reward is
 * real. The UI labels it as a preview.
 *
 * DATA SOURCE SWAP (future)
 * -------------------------
 * `GET /referrals/me` -> { code, link, invitedCount, rewardsEarned }.
 */
import { readJson, setJson, STORAGE_KEYS } from '~/lib/storage';
import { toDayKey } from '~/lib/date';

const DEFAULT = {
  code: null,
  createdAt: null,
  invited: [],
  claimedMilestones: [],
};

const randomCode = (userId) => {
  const seed = `${userId || 'guest'}-${toDayKey()}`;
  const base = Math.abs(Number(String(seed).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) * 2654435761 % 36 ** 8)).toString(36);
  return `CMX${(base + '00000000').slice(0, 8).toUpperCase()}`;
};

const load = (userId) => {
  const state = readJson(STORAGE_KEYS.REFERRAL, DEFAULT) || DEFAULT;
  if (!state.code) {
    const next = { ...state, code: randomCode(userId), createdAt: new Date().toISOString() };
    setJson(STORAGE_KEYS.REFERRAL, next);
    return next;
  }
  return state;
};

export const REFERRAL_REWARDS = {
  friendJoins: [
    { id: 'm1', invites: 1, label: 'Bạn bè đăng ký', reward: '50 Coin' },
    { id: 'm2', invites: 3, label: '3 người đăng ký', reward: '200 Coin + 7 ngày Premium' },
    { id: 'm3', invites: 10, label: '10 người đăng ký', reward: '1.000 Coin + 30 ngày Premium' },
  ],
};

export function getReferral(userId) {
  const state = load(userId);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return {
    ...state,
    link: `${origin}/dang-ky?ref=${state.code}`,
    invitedCount: (state.invited || []).length,
    demo: true,
  };
}

export const getShareText = (userId) => {
  const { code, link } = getReferral(userId);
  return {
    title: 'Rủ bạn cùng đọc truyện',
    text: `Mình đang đọc truyện trên Comics — dùng mã ${code} để tham gia cùng mình nhé!`,
    link,
  };
};

const referralService = { getReferral, getShareText, REFERRAL_REWARDS };

export default referralService;
