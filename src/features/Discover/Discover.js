import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import { Skeleton } from '@mui/material';
import { AutoAwesome, ArrowForwardRounded, ExploreRounded } from '@mui/icons-material';

import styles from './Discover.module.scss';
import paths from '~/routes/paths';
import { getMangasByCategory } from '~/services/mangaService';

const cx = classNames.bind(styles);

const DISCOVER_BLOCKS = [
    { title: 'Thế giới Manhwa', slug: 'manhwa', desc: 'Nét vẽ mê hoặc, cốt truyện kịch tính từ xứ sở Kim Chi.', color: '#3b82f6' },
    { title: 'Kỳ ảo Fantasy', slug: 'fantasy', desc: 'Thế giới phép thuật, chuyển sinh và những cuộc phiêu lưu vô tận.', color: '#8b5cf6' },
    { title: 'Tình cảm Romance', slug: 'romance', desc: 'Ngọt ngào, nhẹ nhàng hay ngược tâm? Tùy bạn chọn.', color: '#ef4444' },
];

export default function Discover() {
    const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            const data = await Promise.all(
                DISCOVER_BLOCKS.map(async (block) => {
                    try {
                        const res = await getMangasByCategory({ path: block.slug, page: 1 });
                        return { ...block, mangas: (res?.result || []).slice(0, 10) };
                    } catch {
                        return { ...block, mangas: [] };
                    }
                }),
            );
            if (mounted) {
                setSections(data);
                setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    return (
        <main className={cx('discoverPage')}>
            <div className={cx('container')}>
                <section className={cx('hero')}>
                    <div className={cx('hero-inner')}>
                        <span className={cx('kicker')}><AutoAwesome /> Tuyển tập mới</span>
                        <h1>Khám phá truyện theo <br/> <span>gu</span> của bạn</h1>
                        <p>Đừng để việc chọn truyện làm khó bạn. Chúng tôi đã phân loại sẵn những tuyển tập chất lượng nhất theo từng vibe riêng biệt.</p>
                    </div>
                </section>

                <div className={cx('content')}>
                    {loading ? (
                        [...Array(3)].map((_, index) => (
                            <section key={index} className={cx('section')}>
                                <div className={cx('sectionHead')}>
                                    <Skeleton width="40%" height={40} sx={{ borderRadius: '8px' }} />
                                    <Skeleton width={100} height={35} sx={{ borderRadius: '10px' }} />
                                </div>
                                <div className={cx('grid')}>
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} variant="rounded" height={320} sx={{ borderRadius: '16px' }} />
                                    ))}
                                </div>
                            </section>
                        ))
                    ) : (
                        sections.map((section) => (
                            <section key={section.slug} className={cx('section')}>
                                <div className={cx('sectionHead')}>
                                    <div className={cx('title-box')}>
                                        <div className={cx('vertical-line')} style={{ backgroundColor: section.color }}></div>
                                        <div>
                                            <h2>{section.title}</h2>
                                            <p>{section.desc}</p>
                                        </div>
                                    </div>
                                    <Link className={cx('view-more')} to={`${paths.category}?slug=${section.slug}`}>
                                        Xem tất cả <ArrowForwardRounded />
                                    </Link>
                                </div>

                                {section.mangas.length > 0 ? (
                                    <div className={cx('grid')}>
                                        {section.mangas.map((manga, idx) => (
                                            <Link key={idx} to={`${paths.mangaDetail}?slug=${manga.slug}`} className={cx('card-link')}>
                                                <div className={cx('manga-card')}>
                                                    <div className={cx('image-wrapper')}>
                                                        <div className={cx('badge', manga.status?.toLowerCase())}>{manga.status}</div>
                                                        <img loading="lazy" src={`${IMG_BASE_URL}${manga.thumb_url}`} alt={manga.name} className={cx('img')} />
                                                        <div className={cx('overlay')}>
                                                            <div className={cx('view-btn')}>Xem ngay</div>
                                                        </div>
                                                    </div>
                                                    <div className={cx('info')}>
                                                        <div className={cx('manga-name')}>{manga.name}</div>
                                                        <div className={cx('meta')}>
                                                            {manga.chaptersLatest?.[0] ? (
                                                                <span className={cx('latest-chapter')}>Chương {manga.chaptersLatest[0].chapter_name}</span>
                                                            ) : <span className={cx('status-text')}>Updating</span>}
                                                            <span className={cx('update-time')}>{new Date(manga.updatedAt).toLocaleDateString('vi-VN')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={cx('empty')}>
                                        <ExploreRounded /> Chưa có dữ liệu cho mục này.
                                    </div>
                                )}
                            </section>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}