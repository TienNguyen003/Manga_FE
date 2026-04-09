import React, { useEffect, useState, useCallback } from 'react';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  History as HistoryIcon,
  Collections,
  PlayCircleFilled,
  AutoAwesome,
  DeleteSweep,
  AddCircleOutline,
  EditRounded,
  DeleteOutline,
  ChevronRight,
  StickyNote2,
} from '@mui/icons-material';

import styles from './Library.module.scss';
import { useUser } from '~/providers/UserContext';
import { getFollows } from '~/services/followService';
import { getContinueReading, getHistory, deleteHistory } from '~/services/historyService';
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  getCollectionDetail,
  deleteCollectionItem,
  updateCollectionItemNote,
} from '~/services/collectionService';
import { getBookmarks } from '~/services/bookmarkService';
import paths from '~/routes/paths';
import { LoadingSpinner, EmptyState, ErrorState } from '~/components/common/AsyncState';

const cx = classNames.bind(styles);

const TABS = [
  { label: 'Đang theo dõi', icon: <Bookmark />, id: 0 },
  { label: 'Tiếp tục đọc', icon: <PlayCircleFilled />, id: 1 },
  { label: 'Lịch sử', icon: <HistoryIcon />, id: 2 },
  { label: 'Bộ sưu tập', icon: <Collections />, id: 3 },
  { label: 'Đánh dấu chương', icon: <AutoAwesome />, id: 4 },
];

export default function Library() {
  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;
  const { userId } = useUser();

  // --- GIỮ NGUYÊN TOÀN BỘ STATE CỦA MÀY ---
  const [activeTab, setActiveTab] = useState(0);
  const [follows, setFollows] = useState([]);
  const [continueList, setContinueList] = useState([]);
  const [history, setHistory] = useState([]);
  const [collections, setCollections] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [collectionDetails, setCollectionDetails] = useState({});
  const [detailLoadingId, setDetailLoadingId] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const quickStats = {
    follows: follows.length,
    continueReading: continueList.length,
    history: history.length,
    collections: collections.length,
    bookmarks: bookmarks.length,
  };

  // --- GIỮ NGUYÊN LOGIC LOAD DATA ---
  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 0) {
        const res = await getFollows({ userId });
        setFollows(res?.result || []);
      } else if (activeTab === 1) {
        const res = await getContinueReading({ userId, limit: 24 });
        setContinueList(res?.result || []);
      } else if (activeTab === 2) {
        const res = await getHistory({ userId });
        setHistory(res?.result || []);
      } else if (activeTab === 3) {
        const res = await getCollections({ userId });
        setCollections(res?.result || []);
      } else {
        const res = await getBookmarks({ userId });
        setBookmarks(res?.result || []);
      }
    } catch {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [userId, activeTab]);

  useEffect(() => {
    load();
  }, [load]);

  // --- GIỮ NGUYÊN CÁC HANDLER CỦA MÀY ---
  const handleDeleteHistory = async (mangaPath) => {
    setHistory((prev) => prev.filter((h) => h.mangaPath !== mangaPath));
    try {
      await deleteHistory({ userId, mangaPath });
    } catch {
      load();
    }
  };

  const handleCreateCollection = async () => {
    const name = newCollectionName.trim();
    if (!name || creatingCollection) return;
    setCreatingCollection(true);
    try {
      await createCollection({ userId, name, collectionName: name });
      setNewCollectionName('');
      load();
    } catch {
      /* toast */
    } finally {
      setCreatingCollection(false);
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    const prev = collections;
    setCollections((curr) => curr.filter((c) => (c.id || c.collectionId) !== collectionId));
    try {
      await deleteCollection({ userId, collectionId });
    } catch {
      setCollections(prev);
    }
  };

  const handleRenameCollection = async (collectionId, currentName) => {
    const nextName = window.prompt('Nhập tên mới cho bộ sưu tập:', currentName || '');
    if (!nextName || !nextName.trim()) return;
    try {
      await updateCollection({ collectionId, userId, name: nextName.trim(), collectionName: nextName.trim() });
      setCollections((prev) => prev.map((c) => (String(c.id || c.collectionId) === String(collectionId) ? { ...c, collectionName: nextName.trim(), name: nextName.trim() } : c)));
    } catch {
      /* ignore */
    }
  };

  const handleToggleDetail = async (collectionId) => {
    if (collectionDetails[collectionId]) {
      setCollectionDetails((prev) => {
        const next = { ...prev };
        delete next[collectionId];
        return next;
      });
      return;
    }
    setDetailLoadingId(collectionId);
    try {
      const res = await getCollectionDetail({ userId, collectionId });
      setCollectionDetails((prev) => ({ ...prev, [collectionId]: res?.result || {} }));
    } catch {
      /* ignore */
    } finally {
      setDetailLoadingId(null);
    }
  };

  // --- RENDER FUNCTIONS (LÀM MỚI UI NHƯNG GIỮ LOGIC) ---
  const renderFollows = () => (
    <div className={cx('manga-grid')}>
      {follows.map((f) => (
        <div key={f.id} className={cx('manga-card')}>
          <Link to={`${paths.mangaDetail}?slug=${f.mangaPath}`} className={cx('img-box')}>
            <img loading='lazy' src={f.thumbnailUrl ? `${IMG_BASE_URL}${f.thumbnailUrl}` : ''} alt={f.mangaName} />
            <div className={cx('card-overlay')}>
              <span>Đọc ngay</span>
            </div>
          </Link>
          <div className={cx('card-info')}>
            <Link to={`${paths.mangaDetail}?slug=${f.mangaPath}`} className={cx('title')}>
              {f.mangaName}
            </Link>
            <div className={cx('meta')}>
              {f.latestChapter && <span className={cx('badge', 'new')}>Mới: {f.latestChapter}</span>}
              {f.lastReadChapter && <span className={cx('badge')}>Đã đọc: {f.lastReadChapter}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCollections = () => (
    <div className={cx('collection-section')}>
      <div className={cx('create-box')}>
        <input value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} placeholder="Tên bộ sưu tập mới..." />
        <button onClick={handleCreateCollection} disabled={!newCollectionName.trim() || creatingCollection}>
          {creatingCollection ? 'Đang tạo...' : 'Tạo mới'}
        </button>
      </div>

      <div className={cx('collection-grid')}>
        {collections.map((c, idx) => {
          const collectionId = c.id || c.collectionId;
          const detail = collectionDetails[collectionId];
          const items = detail?.items || detail?.mangas || [];

          return (
            <div key={collectionId || idx} className={cx('col-card')}>
              <div className={cx('col-info')}>
                <h3>{c.collectionName || c.name || 'Bộ sưu tập'}</h3>
                <p>{c.description}</p>
                <div className={cx('col-stats')}>
                  <span className={cx('badge')}>
                    <Collections /> {c.totalItems ?? c.itemCount ?? 0} truyện
                  </span>
                </div>
                <div className={cx('col-btns')}>
                  <button onClick={() => handleToggleDetail(collectionId)}>{detailLoadingId === collectionId ? 'Đang tải...' : detail ? 'Ẩn' : 'Chi tiết'}</button>
                  <button onClick={() => handleRenameCollection(collectionId, c.collectionName || c.name)}>Đổi tên</button>
                  <button className={cx('del')} onClick={() => handleDeleteCollection(collectionId)}>
                    <DeleteOutline />
                  </button>
                </div>
              </div>

              {detail && items.length > 0 && (
                <div className={cx('col-items')}>
                  {items.slice(0, 12).map((it, i) => {
                    const mangaPath = it.mangaPath || it.slug;
                    return (
                      <div key={it.id || i} className={cx('it-row')}>
                        <Link to={`${paths.mangaDetail}?slug=${mangaPath}`}>{it.mangaName || it.name}</Link>
                        <div className={cx('it-actions')}>
                          <button
                            onClick={async () => {
                              const nextNote = window.prompt('Ghi chú:', it.note || '');
                              if (nextNote === null) return;
                              try {
                                await updateCollectionItemNote({ userId, collectionId, mangaPath, note: nextNote });
                                load(); // Tải lại để cập nhật note
                              } catch {}
                            }}
                          >
                            <StickyNote2 />
                          </button>
                          <button
                            className={cx('del')}
                            onClick={async () => {
                              try {
                                await deleteCollectionItem({ userId, collectionId, mangaPath });
                                handleToggleDetail(collectionId); // Refresh detail
                              } catch {}
                            }}
                          >
                            <DeleteOutline />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render tương tự cho các tab khác... (Mày có thể dùng hàm renderMangaCard chung như ở trên)

  if (!userId)
    return (
      <div className={cx('library-wrapper')}>
        <EmptyState icon="🔒" text="Đăng nhập để xem thư viện." />
      </div>
    );

  return (
    <div className={cx('library-wrapper', 'container-fluid')}>
      <div className={cx('container')}>
        <header className={cx('lib-header')}>
          <div className={cx('header-content')}>
            <span className={cx('kicker')}>Cá nhân hóa</span>
            <h1>
              Thư viện của <span>bạn</span>
            </h1>
            <p>Quản lý truyện đang theo dõi, tiếp tục đọc dở và bộ sưu tập cá nhân.</p>
          </div>
          <div className={cx('stats-grid')}>
            <div className={cx('stat-item')}>
              <span className={cx('val')}>{quickStats.follows}</span>
              <span className={cx('lbl')}>Theo dõi</span>
            </div>
            <div className={cx('stat-item')}>
              <span className={cx('val')}>{quickStats.collections}</span>
              <span className={cx('lbl')}>Bộ sưu tập</span>
            </div>
          </div>
        </header>

        <div className={cx('lib-body')}>
          <aside className={cx('sidebar')}>
            <div className={cx('nav-list')}>
              {TABS.map((tab, i) => (
                <button key={i} className={cx('nav-item', { active: activeTab === i })} onClick={() => setActiveTab(i)}>
                  {tab.icon} <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </aside>

          <main className={cx('main-panel')}>
            <div className={cx('panel-head')}>
              <h2>{TABS[activeTab]?.label}</h2>
            </div>
            <div className={cx('panel-content')}>
              {loading ? (
                <LoadingSpinner />
              ) : error ? (
                <ErrorState text={error} onRetry={load} />
              ) : (
                <>
                  {activeTab === 0 && renderFollows()}
                  {activeTab === 1 && (
                    <div className={cx('manga-grid')}>
                      {continueList.map((c, i) => (
                        <div key={i} className={cx('manga-card')}>
                          <Link to={`${paths.mangaDetail}?slug=${c.mangaPath}`} className={cx('img-box')}>
                            <img loading='lazy' src={`https://sv1.otruyencdn.com/${c.thumbnailUrl}`} alt={c.mangaName} />
                          </Link>
                          <div className={cx('card-info')}>
                            <Link to={`${paths.mangaDetail}?slug=${c.mangaPath}`} className={cx('title')}>
                              {c.mangaName}
                            </Link>
                            <span className={cx('badge', 'new')}>Chap. {c.chapterName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 2 && (
                    <div className={cx('manga-grid')}>
                      {history.map((h, i) => (
                        <div key={i} className={cx('manga-card')}>
                          <Link to={`${paths.mangaDetail}?slug=${h.mangaPath}`} className={cx('img-box')}>
                            <img src={`https://sv1.otruyencdn.com/${h.thumbnailUrl}`} alt={h.mangaName} />
                          </Link>
                          <div className={cx('card-info')}>
                            <Link to={`${paths.mangaDetail}?slug=${h.mangaPath}`} className={cx('title')}>
                              {h.mangaName}
                            </Link>
                            <div className={cx('meta')}>
                              <span className={cx('badge')}>Đã đọc: {h.chapterName}</span>
                              <button className={cx('delete-icon')} onClick={() => handleDeleteHistory(h.mangaPath)}>
                                <DeleteSweep />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 3 && renderCollections()}
                  {activeTab === 4 && (
                    <div className={cx('manga-grid')}>
                      {bookmarks.map((b, i) => (
                        <div key={i} className={cx('manga-card')}>
                          <Link to={`${paths.mangaDetail}?slug=${b.mangaPath}`} className={cx('img-box')}>
                            <img loading='lazy' src={`https://sv1.otruyencdn.com/${b.thumbnailUrl}`} alt={b.mangaName} />
                          </Link>
                          <div className={cx('card-info')}>
                            <div className={cx('title')}>{b.mangaName}</div>
                            <span className={cx('badge', 'new')}>Chương {b.chapterName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
