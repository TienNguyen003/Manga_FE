import React, { useEffect, useState, useCallback } from 'react';
import classNames from 'classnames/bind';
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
import { Link } from 'react-router-dom';
import paths from '~/routes/paths';
import { LoadingSpinner, EmptyState, ErrorState } from '~/components/common/AsyncState';

const cx = classNames.bind(styles);

const TABS = [
  { label: 'Đang theo dõi', icon: '🔖' },
  { label: 'Tiếp tục đọc', icon: '▶️' },
  { label: 'Lịch sử', icon: '🕓' },
  { label: 'Bộ sưu tập', icon: '🗂️' },
  { label: 'Đánh dấu chương', icon: '📌' },
];

export default function Library() {
  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;
  const { userId } = useUser();
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

  const handleDeleteHistory = async (mangaPath) => {
    setHistory((prev) => prev.filter((h) => h.mangaPath !== mangaPath));
    try {
      await deleteHistory({ userId, mangaPath });
    } catch {
      load();
    }
  };

  if (!userId) {
    return (
      <div className={cx('wrapper')}>
        <div className={cx('container-fluid')}>
          <EmptyState icon="🔒" text="Vui lòng đăng nhập để xem thư viện của bạn." />
        </div>
      </div>
    );
  }

  const renderFollows = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState text={error} onRetry={load} />;
    if (!follows.length) return <EmptyState icon="📚" text="Bạn chưa theo dõi truyện nào." />;
    return (
      <div className={cx('grid')}>
        {follows.map((f) => (
          <Link to={`${paths.mangaDetail}?slug=${f.mangaPath}`} key={f.id} className={cx('card')}>
            <img
              src={f.thumbnailUrl ? `${IMG_BASE_URL}${f.thumbnailUrl}` : ''}
              alt={f.mangaName}
              className={cx('cardImg')}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/200x280?text=No+Image';
              }}
            />
            <div className={cx('cardInfo')}>
              <div className={cx('cardTitle')}>{f.mangaName}</div>
              {f.latestChapter && (
                <div className={cx('chip')}>
                  <i className="fa-solid fa-fire" style={{ color: '#fe2c55' }}></i> Mới: {f.latestChapter}
                </div>
              )}
              {f.lastReadChapter && (
                <div className={cx('chip', 'read')}>
                  <i className="fa-solid fa-check"></i> Đã đọc: {f.lastReadChapter}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    );
  };

  const renderContinue = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState text={error} onRetry={load} />;
    if (!continueList.length) return <EmptyState icon="▶️" text="Chưa có truyện nào để tiếp tục đọc." />;
    return (
      <div className={cx('grid')}>
        {continueList.map((item, idx) => (
          <Link to={`${paths.mangaDetail}?slug=${item.mangaPath}`} key={idx} className={cx('card')}>
            <img
              src={item.thumbnailUrl || ''}
              alt={item.mangaName}
              className={cx('cardImg')}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/200x280?text=No+Image';
              }}
            />
            <div className={cx('cardInfo')}>
              <div className={cx('cardTitle')}>{item.mangaName}</div>
              {item.chapterName && (
                <div className={cx('chip', 'read')}>
                  <i className="fa-solid fa-book-open"></i> Chương: {item.chapterName}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    );
  };

  const renderHistory = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState text={error} onRetry={load} />;
    if (!history.length) return <EmptyState icon="🕓" text="Lịch sử đọc truyện của bạn trống." />;
    return (
      <div className={cx('grid')}>
        {history.map((item, idx) => (
          <div key={idx} className={cx('card', 'hasDelete')}>
            <Link to={`${paths.mangaDetail}?slug=${item.mangaPath}`} className={cx('cardLinkWrap')}>
              <img
                src={item.thumbnailUrl || ''}
                alt={item.mangaName}
                className={cx('cardImg')}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/200x280?text=No+Image';
                }}
              />
              <div className={cx('cardInfo')}>
                <div className={cx('cardTitle')}>{item.mangaName}</div>
                {item.chapterName && (
                  <div className={cx('chip')}>
                    <i className="fa-solid fa-clock-rotate-left"></i> {item.chapterName}
                  </div>
                )}
              </div>
            </Link>
            <button className={cx('deleteBtn')} onClick={() => handleDeleteHistory(item.mangaPath)} title="Xóa khỏi lịch sử">
              <i className="fa-solid fa-trash-can"></i> Xóa
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderCollections = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState text={error} onRetry={load} />;

    const handleCreateCollection = async () => {
      const name = newCollectionName.trim();
      if (!name || creatingCollection) return;
      setCreatingCollection(true);
      try {
        await createCollection({ userId, name, collectionName: name });
        setNewCollectionName('');
        load();
      } catch {
        /* toast handled by interceptor */
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
        setCollectionDetails((prev) => ({
          ...prev,
          [collectionId]: res?.result || {},
        }));
      } catch {
        /* ignore */
      } finally {
        setDetailLoadingId(null);
      }
    };

    return (
      <>
        <div className={cx('collectionCreateRow')}>
          <input value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} placeholder="Tên bộ sưu tập mới..." className={cx('collectionInput')} />
          <button className={cx('createBtn')} onClick={handleCreateCollection} disabled={!newCollectionName.trim() || creatingCollection}>
            {creatingCollection ? 'Đang tạo...' : 'Tạo bộ sưu tập'}
          </button>
        </div>

        {!collections.length ? (
          <EmptyState icon="🗂️" text="Bạn chưa có bộ sưu tập nào." />
        ) : (
          <div className={cx('grid', 'collectionGrid')}>
            {collections.map((c, idx) => {
              const collectionId = c.id || c.collectionId;
              const detail = collectionDetails[collectionId];
              const items = detail?.items || detail?.mangas || [];

              return (
                <div key={collectionId || idx} className={cx('card', 'collectionCard')}>
                  <div className={cx('cardInfo')}>
                    <div className={cx('cardTitle')}>{c.collectionName || c.name || 'Bộ sưu tập'}</div>
                    {c.description && <div className={cx('collectionDesc')}>{c.description}</div>}
                    <div className={cx('chip')}>
                      <i className="fa-solid fa-layer-group"></i> {c.totalItems ?? c.itemCount ?? 0} truyện
                    </div>

                    <div className={cx('collectionActions')}>
                      <button className={cx('smallBtn')} onClick={() => handleToggleDetail(collectionId)}>
                        {detailLoadingId === collectionId ? 'Đang tải...' : detail ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                      </button>
                      <button className={cx('smallBtn')} onClick={() => handleRenameCollection(collectionId, c.collectionName || c.name)}>
                        Đổi tên
                      </button>
                      <button className={cx('smallDangerBtn')} onClick={() => handleDeleteCollection(collectionId)}>
                        Xóa
                      </button>
                    </div>

                    {detail && items.length > 0 && (
                      <div className={cx('collectionItems')}>
                        {items.slice(0, 12).map((it, i) => {
                          const mangaPath = it.mangaPath || it.slug;
                          const note = it.note || '';
                          const itemName = it.mangaName || it.name || mangaPath;

                          return (
                            <div key={it.id || i} className={cx('collectionItemRow')}>
                              <Link to={`${paths.mangaDetail}?slug=${mangaPath}`} className={cx('collectionItemLink')}>
                                {itemName}
                              </Link>
                              <div className={cx('collectionItemActions')}>
                                <button
                                  className={cx('smallBtn')}
                                  onClick={async () => {
                                    const nextNote = window.prompt('Ghi chú cho truyện này:', note);
                                    if (nextNote === null) return;
                                    try {
                                      await updateCollectionItemNote({
                                        userId,
                                        collectionId,
                                        mangaPath,
                                        note: nextNote,
                                      });
                                      setCollectionDetails((prev) => ({
                                        ...prev,
                                        [collectionId]: {
                                          ...prev[collectionId],
                                          items: (prev[collectionId]?.items || []).map((item) =>
                                            (item.mangaPath || item.slug) === mangaPath ? { ...item, note: nextNote } : item,
                                          ),
                                        },
                                      }));
                                    } catch {
                                      /* ignore */
                                    }
                                  }}
                                >
                                  Ghi chú
                                </button>
                                <button
                                  className={cx('smallDangerBtn')}
                                  onClick={async () => {
                                    try {
                                      await deleteCollectionItem({ userId, collectionId, mangaPath });
                                      setCollectionDetails((prev) => ({
                                        ...prev,
                                        [collectionId]: {
                                          ...prev[collectionId],
                                          items: (prev[collectionId]?.items || []).filter((item) => (item.mangaPath || item.slug) !== mangaPath),
                                        },
                                      }));
                                    } catch {
                                      /* ignore */
                                    }
                                  }}
                                >
                                  Xóa
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  };

  const renderBookmarks = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState text={error} onRetry={load} />;
    if (!bookmarks.length) return <EmptyState icon="📌" text="Bạn chưa đánh dấu chương nào." />;
    return (
      <div className={cx('grid')}>
        {bookmarks.map((item, idx) => (
          <Link to={`${paths.mangaDetail}?slug=${item.mangaPath}`} key={item.id || idx} className={cx('card')}>
            <img
              src={item.thumbnailUrl ? `https://sv1.otruyencdn.com/${item.thumbnailUrl}` : ''}
              alt={item.mangaName}
              className={cx('cardImg')}
              // onError={(e) => {
              //   e.target.src = 'https://via.placeholder.com/200x280?text=No+Image';
              // }}
            />
            <div className={cx('cardInfo')}>
              <div className={cx('cardTitle')}>{item.mangaName || item.mangaPath}</div>
              {item.chapterName && (
                <div className={cx('chip', 'read')}>
                  <i className="fa-solid fa-bookmark"></i> Chương {item.chapterName}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className={cx('wrapper')}>
      <div className={cx('container-fluid')}>
        <h1 className={cx('pageTitle')}>Thư viện của tôi</h1>
        <div className={cx('tabs')}>
          {TABS.map((tab, i) => (
            <button key={i} className={cx('tab', { active: activeTab === i })} onClick={() => setActiveTab(i)}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
        <div className={cx('content')}>
          {activeTab === 0 && renderFollows()}
          {activeTab === 1 && renderContinue()}
          {activeTab === 2 && renderHistory()}
          {activeTab === 3 && renderCollections()}
          {activeTab === 4 && renderBookmarks()}
        </div>
      </div>
    </div>
  );
}
