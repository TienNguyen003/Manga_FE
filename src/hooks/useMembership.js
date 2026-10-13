/**
 * useMembership — thin slice over ReaderStatsProvider + the real membership API
 *
 * ⚠️ NO PAYMENT GATEWAY. `subscribe()` records the intent server-side but moves
 * no money, so the UI must never present it as a completed purchase.
 * `TOPUP_IS_SIMULATED` is surfaced here so every consumer can label it from one
 * place instead of inventing its own wording.
 */
import { useCallback } from 'react';

import { useReaderStats } from '~/providers/ReaderStatsProvider';
import {
  PLANS,
  cancel as cancelPlan,
  fetchMembership,
  hasRealPayment,
  subscribe as subscribePlan,
} from '~/services/membershipService';
import { TOPUP_IS_SIMULATED, earnCoins, purchasePack, refreshWallet, spendCoins } from '~/services/coinService';

export default function useMembership() {
  const { membership, isPremium, wallet } = useReaderStats();

  /**
   * Start a subscription. Returns `{ ok, membership }`.
   * ⚠️ Simulated — no money moves, so callers must not show a receipt.
   */
  const upgrade = useCallback(async (planId = 'premium') => {
    await subscribePlan(planId);
    const next = await fetchMembership();
    return { ok: next.isPremium, membership: next };
  }, []);

  /** End the subscription server-side and refresh the local mirror. */
  const cancel = useCallback(async () => {
    await cancelPlan();
    return fetchMembership();
  }, []);

  /** ⚠️ Virtual coins only — no real charge. */
  const buyPack = useCallback((packId) => purchasePack(packId), []);
  const earn = useCallback((amount, meta) => earnCoins(amount, meta), []);
  const spend = useCallback((amount, meta) => spendCoins(amount, meta), []);
  const refresh = useCallback(() => refreshWallet(), []);

  return {
    membership,
    isPremium,
    // ⚠️ There is no payment gateway — surfaced so UIs can label it.
    isDemoMode: TOPUP_IS_SIMULATED,
    isSimulated: TOPUP_IS_SIMULATED,
    hasRealPayment: hasRealPayment(membership),
    plan: isPremium ? PLANS[1] : PLANS[0],
    plans: PLANS,
    wallet,
    balance: wallet?.balance ?? 0,
    upgrade,
    cancel,
    buyPack,
    earn,
    spend,
    refresh,
  };
}

export { useMembership };

