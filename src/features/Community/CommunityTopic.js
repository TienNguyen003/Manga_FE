import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { communityService } from '~/services/communityService';
import classNames from 'classnames/bind';
import styles from './CommunityTopic.module.scss';

const cx = classNames.bind(styles);

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function CommunityTopic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    communityService
      .getPosts(id)
      .then((res) => {
        if (!mounted) return;
        setPosts(res?.result?.posts || []);
        setTopic(res?.result || null);
      })
      .catch(() => {
        if (mounted) setError('Không thể tải danh sách bài viết.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <main className={cx('topicPage')}>
      <div className={cx('container-fluid')}>
        <section className={cx('hero')}>
          <div className={cx('topicTitle')}>Thảo luận chủ đề</div>
          {topic && <div className={cx('topicSubtitle')}>{topic.title}</div>}
        </section>
        <section className={cx('postList')}>
          {loading && <div>Đang tải bài viết...</div>}
          {error && <div className={cx('error')}>{error}</div>}
          {!loading && !error && posts.length === 0 && <div>Chưa có bài viết nào.</div>}
          {!loading &&
            !error &&
            posts.map((post) => (
              <article
                key={post.id}
                className={cx('postCard')}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/cong-dong/post/${post.id}`)}
              >
                <div className={cx('avatar')}>{getInitials(post.author?.username)}</div>
                <div style={{ flex: 1 }}>
                  <div className={cx('author')}>{post.author?.username}</div>
                  <div className={cx('content')}>{post.content}</div>
                  <div className={cx('meta')}>{new Date(post.createdAt).toLocaleString()}</div>
                </div>
              </article>
            ))}
        </section>
      </div>
    </main>
  );
}
