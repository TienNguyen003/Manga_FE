/**
 * WALLET — real backend endpoints (replaces the previous localStorage mock).
 *
 *   GET  /wallet/me       -> { balance, lifetimeEarned, lifetimeSpent }
 *   GET  /wallet/overview -> ONE call for the paywall modal:
 *                            balance + packages + recent transactions
 *   POST /wallet/topup    -> ⚠️ SIMULATED top-up, returns 201
 *   POST /wallet/spend
 *   POST /wallet/unlock-chapter -> idempotent unlock
 *   GET  /wallet/history?limit=
 *
 * ⚠️ THERE IS NO PAYMENT GATEWAY. `topup` mints virtual coins and charges
 * nothing. Any UI must label it "mô phỏng" and must NOT display a real VND
 * amount as if money had been paid (see TOPUP_IS_SIMULATED).
 */
import { get, post } from '~/lib/httpRequest';

const url = '/wallet';

/**
 * No payment provider is wired up yet. Exported as a constant so every screen
 * that shows a top-up form reads the flag from one place instead of inventing
 * its own wording.
 */
export const TOPUP_IS_SIMULATED = true;

export const getWallet = () => get(`${url}/me`);

/** Single call that fills the whole paywall modal — prefer it over 3 requests. */
export const getOverview = (limit = 10) => get(`${url}/overview`, { params: { limit } });

/** ⚠️ Virtual coins only — no real charge. Always label the UI as simulation. */
export const topup = (amount) => post(`${url}/topup`, { amount });

export const spend = (amount, reason) => post(`${url}/spend`, { amount, reason });

/**
 * Idempotent unlock. `true` = just unlocked (coins deducted),
 * `false` = already unlocked (nothing charged).
 *
 * The backend still trusts the client `price` until it moves to a server-side
 * lookup — send the real price from the PAYWALL_LOCKED payload; it will be
 * ignored once that is fixed.
 */
export async function unlockChapter(chapterId, price) {
  const { data } = await post(`${url}/unlock-chapter`, { chapterId, price });
  return Boolean(data?.result);
}

export const getHistory = (limit = 20) => get(`${url}/history`, { params: { limit } });

/* ------------------------------------------------------------------ *
 * Shape helpers — keep screens free of `data.result` plumbing
 * ------------------------------------------------------------------ */

export async function fetchBalance() {
  const { data } = await getWallet();
  return {
    balance: Number(data?.result?.balance ?? 0),
    lifetimeEarned: Number(data?.result?.lifetimeEarned ?? 0),
    lifetimeSpent: Number(data?.result?.lifetimeSpent ?? 0),
  };
}

export async function fetchOverview(limit = 10) {
  const { data } = await getOverview(limit);
  const result = data?.result ?? {};
  return {
    balance: Number(result.balance ?? 0),
    packages: Array.isArray(result.packages) ? result.packages : [],
    transactions: Array.isArray(result.transactions) ? result.transactions : [],
  };
}

const walletService = {
  TOPUP_IS_SIMULATED,
  getWallet,
  getOverview,
  topup,
  spend,
  unlockChapter,
  getHistory,
  fetchBalance,
  fetchOverview,
};

export default walletService;
