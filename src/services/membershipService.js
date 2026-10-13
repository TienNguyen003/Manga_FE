/**
 * MEMBERSHIP — real backend endpoints, with a local cache fallback.
 *
 *   GET  /membership/me        -> current subscription
 *   GET  /membership/history
 *   POST /membership/subscribe
 *   POST /membership/cancel
 *
 * ⚠️ NO PAYMENT GATEWAY IS CONNECTED. `membership.demo` is ALWAYS `false` from
 * the server, and `subscribe()` does not move money. UI must therefore render
 * plans as informational and must NOT present a completed purchase — see
 * `hasRealPayment`.
 *
 * The plan CATALOG below stays client-side (it is product copy, not server
 * state); only the user's actual status comes from the API.
 */
import { get, post } from '~/lib/httpRequest';

export const PLANS = [
  {
    id: 'free',
    name: 'FREE',
    price: 0,
    priceLabel: '0đ',
    period: '',
    tagline: 'Đọc miễn phí, không giới hạn chương cơ bản',
    features: [
      { label: 'Đọc chương miễn phí', included: true },
      { label: 'Theo dõi truyện & nhận thông báo', included: true },
      { label: 'Lịch sử đọc & thư viện', included: true },
      { label: 'Đọc không quảng cáo', included: false },
      { label: 'Xem chương sớm', included: false },
      { label: 'Mở khóa bằng Coin', included: false },
      { label: 'Cài đặt trình đọc nâng cao', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    price: 4.99,
    priceLabel: '4,99 USD',
    period: '/ tháng',
    tagline: 'Dành cho người đọc chăm chỉ mỗi ngày',
    popular: true,
    features: [
      { label: 'Đọc chương miễn phí', included: true },
      { label: 'Theo dõi truyện & nhận thông báo', included: true },
      { label: 'Lịch sử đọc & thư viện', included: true },
      { label: 'Đọc không quảng cáo', included: true },
      { label: 'Xem chương sớm', included: true },
      { label: 'Mở khóa bằng Coin', included: true },
      { label: 'Cài đặt trình đọc nâng cao', included: true },
    ],
  },
];

export const PREMIUM_BENEFITS = [
  { id: 'ad-free', label: 'Đọc không quảng cáo', icon: '🚫' },
  { id: 'early-access', label: 'Xem chương sớm', icon: '⏩' },
  { id: 'premium-chapters', label: 'Mở khóa chương Premium', icon: '💎' },
  { id: 'premium-badge', label: 'Huy hiệu Premium', icon: '👑' },
  { id: 'advanced-reader', label: 'Cài đặt trình đọc nâng cao', icon: '⚙️' },
];

const url = '/membership';

/**
 * True only when the subscription is genuinely ACTIVE and NOT a demo.
 * `membership.demo` is always false server-side, so today this is effectively
 * "an ACTIVE subscription" — kept explicit so the day a payment gateway lands
 * the demo flag alone can never be mistaken for a paid plan.
 */
export function hasRealPayment(membership) {
  return Boolean(membership && membership.demo === false && membership.status === 'ACTIVE');
}

/** `GET /membership/me` -> `data.result` */
export async function fetchMembership() {
  try {
    const { data } = await get(`${url}/me`);
    const result = data?.result ?? {};
    const isPremium = hasRealPayment(result);
    return {
      ...result,
      demo: result.demo ?? false,
      isPremium,
      // Keep the existing consumer shape: `plan` is the catalogue entry.
      plan: isPremium ? PLANS[1] : PLANS[0],
    };
  } catch {
    // Not logged in, or endpoint unavailable -> treat as the free plan.
    return { demo: false, isPremium: false, status: null, plan: PLANS[0] };
  }
}

export const getHistory = () => get(`${url}/history`);

/** ⚠️ No payment is processed — the server records the intent only. */
export const subscribe = (planId) => post(`${url}/subscribe`, { planId });

export const cancel = () => post(`${url}/cancel`);

/**
 * Synchronous reader used by components that already hold membership state in
 * context. Returns the free plan when nothing is known yet.
 */
export function getMembership(state) {
  if (!state) return { isPremium: false, demo: false, plan: PLANS[0] };
  return state;
}

export const isPremium = (state) => Boolean(state?.isPremium);

/** Kept for API compatibility — no demo mode exists once the API is wired. */
export const isDemoMode = () => false;

const membershipService = {
  PLANS,
  PREMIUM_BENEFITS,
  hasRealPayment,
  fetchMembership,
  getMembership,
  isPremium,
  isDemoMode,
  getHistory,
  subscribe,
  cancel,
};

export default membershipService;

