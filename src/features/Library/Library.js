import React, { useEffect, useState, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './Library.module.scss';
import { useUser } from '~/providers/UserContext';
import { getFollows } from '~/services/followService';
import { getContinueReading, getHistory, deleteHistory } from '~/services/historyService';
import { Link } from 'react-router-dom';
import paths from '~/routes/paths';
import { LoadingSpinner, EmptyState, ErrorState } from '~/components/common/AsyncState';

const cx = classNames.bind(styles);

const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || '';

const TABS = [
  { label: 'Đang theo dõi', icon: '🔖' },
  { label: 'Tiếp tục đọc', icon: '▶️' },
  { label: 'Lịch sử', icon: '🕓' },
];

export default function Library() {
  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;
  const { userId } = useUser();
  const [activeTab, setActiveTab] = useState(0);
  const [follows, setFollows] = useState([]);
  const [continueList, setContinueList] = useState([]);
  const [history, setHistory] = useState([]);
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
      } else {
        const res = await getHistory({ userId });
        setHistory(res?.result || []);
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
        </div>
      </div>
    </div>
  );
}
