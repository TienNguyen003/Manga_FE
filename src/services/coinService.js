/**
 * COIN WALLET — thin client over the REAL `/wallet/*` endpoints.
 *
 * ⚠️ `topup` mints VIRTUAL coins. There is no payment gateway, so nothing is
 * ever charged — `TOPUP_IS_SIMULATED` is exported so every UI can label it
 * instead of showing a real VND amount as if money had been paid.
 *
 * The pack catalogue stays client-side (product copy), but balances, spending
 * and the ledger are server-owned. `getWallet` is a synchronous snapshot of the
 * last known state for render paths that must not await.
 */
import walletService, { TOPUP_IS_SIMULATED, fetchBalance } from '~/services/walletService';

export { TOPUP_IS_SIMULATED };

/**
 * Catalogue copy for the top-up screen. These are NOT prices — the backend does
 * not process money, so `priceLabel` must never be shown as a real charge
 * without the simulation notice next to it.
 */
export const COIN_PACKS = [
  { id: 'small', coins: 500, priceLabel: '500 Coin', perChapter: '100 chương' },
  { id: 'medium', coins: 1200, priceLabel: '1.200 Coin', perChapter: '240 chương', popular: true },
  { id: 'large', coins: 3000, priceLabel: '3.000 Coin', perChapter: '600 chương' },
];

/** Ways to earn coins — described in the UI, granted server-side on completion. */
export const COIN_JOBS = [
  { id: 'daily-goal', label: 'Hoàn thành mục tiêu hôm nay', coins: 20, repeatable: 'daily' },
  { id: 'challenge', label: 'Hoàn thành thử thách hôm nay', coins: 30, repeatable: 'daily' },
  { id: 'streak-7', label: 'Giữ chuỗi đọc 7 ngày', coins: 100, repeatable: 'once' },
  { id: 'achievement', label: 'Mở khóa thành tựu', coins: 50, repeatable: 'per-achievement' },
];

/** Last known server balance, refreshed by `refreshWallet`. */
let snapshot = { balance: 0, lifetimeEarned: 0, lifetimeSpent: 0 };

export const getWallet = () => snapshot;

export const getBalance = () => snapshot.balance;

/** Pull the authoritative balance from `GET /wallet/me`. */
export async function refreshWallet() {
  try {
    snapshot = await fetchBalance();
  } catch {
    /* keep the last known snapshot rather than blanking the balance */
  }
  return snapshot;
}

/**
 * Credit coins. The server owns the ledger, so the outcome reported here is the
 * one the backend gave us: `{ ok, balance, wallet }` or `{ ok: false, reason }`.
 */
export async function earnCoins(amount, meta = {}) {
  // The wallet exposes no "earn" endpoint — top-up is its only credit path.
  // Quest/achievement rewards must be granted server-side.
  const coins = Math.max(0, Math.floor(Number(amount) || 0));
  if (coins === 0) return { ok: false, reason: 'INVALID_AMOUNT', wallet: snapshot };

  await walletService.topup(coins);
  const wallet = await refreshWallet();
  return { ok: true, balance: wallet.balance, wallet, label: meta.label || null };
}

/**
 * Debit coins. Never goes negative — the server rejects with
 * `422 INSUFFICIENT_COINS`, surfaced here as `reason: 'INSUFFICIENT'` so the
 * UI can offer a real next step (top-up) instead of failing silently.
 */
export async function spendCoins(amount, meta = {}) {
  const coins = Math.max(0, Math.floor(Number(amount) || 0));
  if (coins === 0) return { ok: false, reason: 'INVALID_AMOUNT', wallet: snapshot };

  try {
    await walletService.spend(coins, meta.label || 'Mở khóa chương');
  } catch (error) {
    const code = error?.response?.data?.code;
    if (code === 'INSUFFICIENT_COINS') {
      return { ok: false, reason: 'INSUFFICIENT', balance: snapshot.balance, needed: coins, wallet: snapshot };
    }
    return { ok: false, reason: code || 'ERROR', wallet: snapshot };
  }

  const wallet = await refreshWallet();
  return { ok: true, balance: wallet.balance, wallet };
}

/**
 * ⚠️ SIMULATED top-up — grants virtual coins, charges nothing.
 * `simulated: true` is returned so the caller can state that on screen.
 */
export async function purchasePack(packId) {
  const pack = COIN_PACKS.find((p) => p.id === packId) || COIN_PACKS[1];
  const result = await earnCoins(pack.coins, { label: `Gói ${pack.coins} Coin`, ref: `pack:${pack.id}` });
  return { ...result, pack, simulated: true };
}

const coinService = {
  COIN_PACKS,
  COIN_JOBS,
  TOPUP_IS_SIMULATED,
  getWallet,
  getBalance,
  refreshWallet,
  earnCoins,
  spendCoins,
  purchasePack,
};

export default coinService;
