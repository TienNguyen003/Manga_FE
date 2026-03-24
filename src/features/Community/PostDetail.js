import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { communityService } from '~/services/communityService';
import classNames from 'classnames/bind';
import styles from './PostDetail.module.scss';

const cx = classNames.bind(styles);

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    communityService
      .getPostComments(id)
      .then((res) => {
        if (!mounted) return;
        setPost(res?.post || null);
        setComments(res?.result || []);
      })
      .catch(() => {
        if (mounted) setError('Không thể tải chi tiết bài viết.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <main className={cx('postDetailPage')}>
      <div className={cx('container-fluid')}>
        {loading && <div>Đang tải chi tiết bài viết...</div>}
        {error && <div className={cx('error')}>{error}</div>}
        {!loading && !error && post && (
          <section className={cx('postCard')}>
            <div className={cx('author')}>{post.author?.username}</div>
            <div className={cx('content')}>{post.content}</div>
            <div className={cx('meta')}>{new Date(post.createdAt).toLocaleString()}</div>
          </section>
        )}
        {!loading && !error && (
          <section className={cx('commentsSection')}>
            <h2>Bình luận</h2>
            {comments.length === 0 && <div>Chưa có bình luận nào.</div>}
            {comments.map((c) => (
              <div key={c.id} className={cx('commentCard')}>
                <div className={cx('commentAuthor')}>{c.author?.username}</div>
                <div className={cx('commentContent')}>{c.content}</div>
                <div className={cx('commentMeta')}>{new Date(c.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
