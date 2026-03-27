import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityService } from '~/services/communityService';
import classNames from 'classnames/bind';
import styles from './Community.module.scss';

const cx = classNames.bind(styles);

export default function Community() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    communityService.getTopics().then((res) => {
      setTopics(res?.result || []);
      setLoading(false);
    });
  }, []);

  return (
    <main className={cx('communityPage')}>
      <div className={cx('container')}>
        <header className={cx('header')}>
          <div className={cx('titleGroup')}>
            <h1 className={cx('giantTitle')}>
              CỘNG ĐỒNG
            </h1>
            <div className={cx('statusBadge')}>
              <span className={cx('dot')}></span> 2.4k người đang online
            </div>
          </div>
          <p className={cx('subTitle')}>Kết nối tri thức, chia sẻ đam mê sáng tác và thảo luận truyện.</p>
        </header>

        <section className={cx('bentoGrid')}>
          {loading ? (
            <div className={cx('loader')}>Đang khởi tạo không gian...</div>
          ) : (
            topics.map((topic, index) => {
              const isLarge = topic.description?.length > 40;

              return (
                <div key={topic.id} className={cx('bentoCard', isLarge ? 'cardLarge' : 'cardSmall')} onClick={() => navigate(`/cong-dong/topic/${topic.id}`)}>
                  <div className={cx('cardContent')}>
                    <div className={cx('top')}>
                      <span className={cx('topicLabel')}>Chủ đề #{index + 1}</span>
                      <h3>{topic.name}</h3>
                      <p className={cx('cardDesc')}>{topic.description}</p>
                    </div>

                    <div className={cx('footer')}>
                      <span className={cx('postCount')}>
                        <b>{topic.postCount}</b> bài viết
                      </span>
                      <div className={cx('goBtn')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
