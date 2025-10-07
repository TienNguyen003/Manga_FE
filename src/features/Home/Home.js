import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Home.module.scss';
import Banner from './Banner';
import MediaSecttion from './MediaSecttion';
import InnerBanner from './InnerBanner';
import TopShow from './TopShow';

import { getMangasByCategory } from '~/services/mangaService';

const cx = classNames.bind(styles);

export default function Home() {
  const [articlesSection, setArticlesSection] = useState({});
  const [liveActionSection, setLiveActionSection] = useState({});
  const [popularSection, setPopularSection] = useState({});
  const [trendingSection, setTrendingSection] = useState({});
  const [topViewData, setTopViewData] = useState({});

  const arrayCategory = [
    {
      title: 'Manhua',
      subTitle: 'Dive into Chinese stories filled with unique art and culture',
      slug: 'manhua',
    },
    {
      title: 'Manhwa',
      subTitle: 'Discover the best of Korean comics with stunning visuals',
      slug: 'manhwa',
    },
    {
      title: 'Romance',
      subTitle: 'Feel the heartbeat with touching and emotional love stories',
      slug: 'romance',
    },
    {
      title: 'Drama',
      subTitle: 'Experience thrilling twists and unforgettable storylines',
      slug: 'drama',
    },
    {
      title: 'Fantasy',
      subTitle: 'Embark on epic adventures filled with magic, mystery, and legendary heroes.',
      slug: 'fantasy',
    },
  ];

  useEffect(() => {
    arrayCategory.forEach((item) => {
      getManga(item.title, item.subTitle, item.slug);
    });
  }, []);

  const getManga = async (title, subTitle, slug) => {
    const res = await getMangasByCategory({ path: slug, page: 1 });
    const objectManga = { title, subTitle, slug, data: res.result };
    switch (title) {
      case 'Manhua':
        setLiveActionSection(objectManga);
        break;
      case 'Manhwa':
        setPopularSection(objectManga);
        break;
      case 'Romance':
        setTopViewData(objectManga);
        break;
      case 'Drama':
        setTrendingSection(objectManga);
        break;
      case 'Fantasy':
        setArticlesSection(objectManga);
        break;
      default:
        break;
    }
  };

  return (
    <div className={cx('')}>
      <Banner />
      <MediaSecttion artic={articlesSection} />
      <MediaSecttion artic={liveActionSection} />
      <InnerBanner />
      <MediaSecttion artic={popularSection} />
      <TopShow topShow={topViewData} />
      <MediaSecttion artic={trendingSection} />
    </div>
  );
}
