import React, { useEffect, useState, useCallback, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './CommentSection.module.scss';
import { useUser } from '~/providers/UserContext';
import { getComments, getReplies, postComment, likeComment, unlikeComment, deleteComment } from '~/services/commentService';
import { connectStomp, subscribe, disconnectStomp } from '~/lib/realtime';
import { LoadingSpinner, EmptyState } from '~/components/common/AsyncState';

const cx = classNames.bind(styles);

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

function CommentItem({ comment, userAvatar, userId, mangaPath, chapterName, mangaName, onDelete, level = 1 }) {
  const [liked, setLiked] = useState(comment.likedByCurrentUser);
  const [likesCount, setLikesCount] = useState(comment.totalLikes || 0);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState([]);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLike = async () => {
    if (!userId) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((c) => (wasLiked ? c - 1 : c + 1));
    try {
      if (wasLiked) await unlikeComment({ commentId: comment.id, userId });
      else await likeComment({ commentId: comment.id, userId });
    } catch {
      setLiked(wasLiked);
      setLikesCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  };

  const toggleReplies = async () => {
    if (!repliesLoaded) {
      setRepliesLoading(true);
      try {
        const res = await getReplies({ parentCommentId: comment.id, currentUserId: userId || '' });
        setReplies(res?.result || []);
        setRepliesLoaded(true);
      } finally { setRepliesLoading(false); }
    }
    setShowReplies((v) => !v);
  };

  const handlePostReply = async () => {
    if (!replyText.trim() || !userId || submitting) return;
    setSubmitting(true);
    try {
      const res = await postComment({
        userId, mangaPath, mangaName,
        chapterName: chapterName || undefined,
        content: replyText.trim(),
        parentCommentId: comment.id,
      });
      const newReply = res?.result || res;
      setReplies((prev) => [...prev, newReply]);
      setReplyText('');
      setShowReplyInput(false);
      if (!showReplies) setShowReplies(true);
    } finally { setSubmitting(false); }
  };

  // Logic xóa bình luận con (reply) ngay tại component chứa nó
  const handleDeleteLocal = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    try {
      await deleteComment({ commentId: id, userId });
      setReplies((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  return (
    <div className={cx('commentWrapper', { [`level-${level}`]: level > 1 })}>
      {/* Chỉ phần này là có border */}
      <div className={cx('commentBody')}>
        <img src={userAvatar || 'https://via.placeholder.com/40'} className={cx('commentAvatar')} />
        <div className={cx('commentContentSection')}>
          <div className={cx('commentHeader')}>
            <span className={cx('commentUser')}>{comment.userDisplayName || comment.username}</span>
            <span className={cx('commentTime')}>{timeAgo(comment.createdAt)}</span>
            {userId === String(comment.userId) && (
              <button className={cx('deleteBtn')} onClick={() => onDelete(comment.id)} title="Xóa">
                <i className="fa-solid fa-trash-can"></i>
              </button>
            )}
          </div>
          <p className={cx('commentContent')}>{comment.content}</p>
          <div className={cx('commentActions')}>
            <button className={cx('actionBtn', { liked })} onClick={handleLike} disabled={!userId}>
              <i className={liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
              <span>{likesCount}</span>
            </button>
            {userId && level < 3 && (
              <button className={cx('actionBtn')} onClick={() => setShowReplyInput((v) => !v)}>
                <i className="fa-regular fa-comment"></i>
                <span>Trả lời</span>
              </button>
            )}
            {(comment.totalReplies > 0 || replies.length > 0) && (
              <button className={cx('actionBtn', 'replyToggle')} onClick={toggleReplies}>
                <i className={showReplies ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down"}></i>
                <span>{showReplies ? 'Ẩn' : 'Xem'} {replies.length > 0 ? replies.length : comment.totalReplies} trả lời</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Input trả lời và Danh sách con nằm NGOÀI commentBody để tránh lồng border */}
      {showReplyInput && (
        <div className={cx('replyInput')}>
          <input
            type="text"
            className={cx('inputField')}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Viết trả lời..."
          />
          <button className={cx('submitBtn')} onClick={handlePostReply} disabled={!replyText.trim() || submitting}>Gửi</button>
        </div>
      )}

      {repliesLoading && <LoadingSpinner text="" />}
      
      {showReplies && replies.length > 0 && (
        <div className={cx(level < 3 ? 'repliesContainer' : 'flatReplies')}>
          {replies.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              userAvatar={r.userAvatar}
              userId={userId}
              mangaPath={mangaPath}
              chapterName={chapterName}
              mangaName={mangaName}
              onDelete={handleDeleteLocal}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ mangaPath, chapterName, mangaName, title = 'Bình luận' }) {
  const { userId, username } = useUser();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    if (!mangaPath) return;
    setLoading(true);
    try {
      const res = await getComments({ mangaPath, chapterName: chapterName || undefined, currentUserId: userId || '' });
      setComments(res?.result || []);
    } finally { setLoading(false); }
  }, [mangaPath, chapterName, userId]);

  useEffect(() => { loadComments(); }, [loadComments]);

  const handlePost = async () => {
    if (!newComment.trim() || !userId || submitting) return;
    setSubmitting(true);
    try {
      const res = await postComment({
        userId, mangaPath, mangaName,
        chapterName: chapterName || undefined,
        content: newComment.trim(),
      });
      setComments((prev) => [res?.result || res, ...prev]);
      setNewComment('');
    } finally { setSubmitting(false); }
  };

  const handleDeleteRoot = async (commentId) => {
    if (!window.confirm("Xóa bình luận này?")) return;
    try {
      await deleteComment({ commentId, userId });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (e) { console.error(e); }
  };

  return (
    <div className={cx('section')}>
      <h3 className={cx('sectionTitle')}>Bình luận {comments.length > 0 && <span className={cx('count')}>{comments.length}</span>}</h3>
      {userId ? (
        <div className={cx('inputRow')}>
          <div className={cx('inputAvatar')}>{(username || '?').charAt(0).toUpperCase()}</div>
          <div className={cx('inputWrap')}>
            <textarea
              className={cx('textarea')}
              rows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Nhận xét của bạn..."
            />
            <button className={cx('postBtn')} onClick={handlePost} disabled={!newComment.trim() || submitting}>Đăng</button>
          </div>
        </div>
      ) : <p className={cx('loginNotice')}>Vui lòng đăng nhập để bình luận.</p>}

      <div className={cx('list')}>
        {loading ? <LoadingSpinner /> : comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            userAvatar={c.userAvatar}
            userId={userId}
            mangaPath={mangaPath}
            chapterName={chapterName}
            mangaName={mangaName}
            onDelete={handleDeleteRoot}
            level={1}
          />
        ))}
      </div>
    </div>
  );
}