import { useCallback, useEffect, useState } from 'react';

import contentAccessService, {
  ACCESS_EARLY,
  ACCESS_META,
  ACCESS_PREMIUM,
} from '~/services/contentAccessService';
import { spendCoins } from '~/services/coinService';
import { awardXp, XP_REWARDS } from '~/services/xpService';
import { useUser } from '~/providers/UserContext';
import { toast } from 'react-toastify';

/**
 * useContentAccess — Component -> Hook -> Service -> MOCK rules + LOCAL ledger
 *
 * Central gate for every monetised surface (chapter list, reader dropdown,
 * Home rail, Library). Returns a resolver plus a `unlock` action that runs the
 * coin flow and reports the real outcome (success / insufficient) — it never
 * pretends a purchase succeeded silently.
 */
export default function useContentAccess() {
  const { userId } = useUser();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener('storage', bump);
    return () => window.removeEventListener('storage', bump);
  }, []);

  const resolve = useCallback(
    (params) => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      void version;
      const access = contentAccessService.resolveChapterAccess(params);
      return { ...access, meta: ACCESS_META[access.type] || ACCESS_META.FREE };
    },
    [version],
  );

  /**
   * Runs the pay-per-chapter flow.
   * @returns {{status:'unlocked'|'insufficient'|'error', ...}}
   */
  const unlock = useCallback(
    ({ mangaPath, chapterName, chapterIndex, totalChapters, price }) => {
      const access = contentAccessService.resolveChapterAccess({
        mangaPath,
        chapterName,
        index: chapterIndex ?? 0,
        totalChapters: totalChapters ?? 0,
      });

      if (access.canRead) return { status: 'unlocked', access };

      if (access.type === ACCESS_EARLY) {
        return { status: 'requires_premium', access };
      }

      const cost = price ?? access.price;
      const result = spendCoins(cost, { label: `Mở khóa chương ${chapterName}`, ref: `${mangaPath}:${chapterName}` });

      if (!result.ok) {
        return {
          status: 'insufficient',
          access,
          balance: result.balance,
          needed: result.needed ?? cost,
        };
      }

      contentAccessService.unlockChapter(mangaPath, chapterName);
      setVersion((v) => v + 1);
      awardXp(XP_REWARDS.COMPLETE_CHAPTER, `unlock:${mangaPath}:${chapterName}`);
      toast.success(`🔓 Đã mở khóa chương ${chapterName} với ${cost} Coin`);
      return { status: 'unlocked', access: { ...access, canRead: true, reason: 'UNLOCKED_WITH_COINS' }, balance: result.balance };
    },
    [],
  );

  return {
    resolve,
    unlock,
    isUnlocked: contentAccessService.isChapterUnlocked,
    summarise: contentAccessService.summariseComicAccess,
    userId,
    coinPrice: contentAccessService.CHAPTER_COIN_PRICE,
    premiumWindow: contentAccessService.PREMIUM_WINDOW,
    isPremiumLocked: (access) => access?.type === ACCESS_PREMIUM || access?.type === ACCESS_EARLY,
  };
}

export { useContentAccess };
