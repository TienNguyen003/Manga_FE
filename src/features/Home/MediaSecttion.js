import React from 'react';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';

import paths from '~/routes/paths';
import styles from './Home.module.scss';

const cx = classNames.bind(styles);

export default function MediaSecttion({ artic }) {
  const { title, subTitle, slug, data = [] } = artic || {};
  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL;

  return (
    <section className={cx('article-section')}>
      <div className={cx('container-fluid')}>
        <div className={cx('heading')}>
          <div className={cx('heading-text')}>
            <h2>{title}</h2>
            <p className={cx('mt-16')}>{subTitle}</p>
          </div>
          <Link to={`${paths.category}?slug=${slug}`} className={cx('cus-arrow-btn')}>
            View All
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M0.00390625 10.0019C0.00390625 11.3509 1.09765 12.4447 2.44666 12.4447H12.2812L9.98864 15.1439C9.11475 16.1723 9.24116 17.7131 10.2696 18.587C10.7288 18.9778 11.2906 19.1671 11.8494 19.1671C12.5419 19.1671 13.2296 18.8746 13.7126 18.3061L19.4231 11.5824C20.1975 10.6712 20.1975 9.33078 19.4231 8.42025L13.7126 1.69659C12.8387 0.668189 11.298 0.542387 10.2696 1.41628C9.24116 2.29017 9.11475 3.83094 9.98864 4.85933L12.2812 7.55857H2.44666C1.09765 7.55857 0.00390625 8.65231 0.00390625 10.0019Z"
                fill="#EA982B"
              />
            </svg>
          </Link>
        </div>

        <div className="row row-gap-4">
          {data.slice(0, 4).map((article, i) => (
            <div key={i} className="pc-3 pr-2 pl-2">
              <Link to={`${paths.mangaDetail}?slug=${article.slug}`} className={cx('article-container', 'w-100', 'h-100')}>
                <img src={`${IMG_BASE_URL}${article.thumb_url}`} alt={article.name} loading="lazy" className={cx('article-image', 'w-100', 'h-100')} />
                <div className={cx('article-text')}>
                  <div className="d-flex align-items-center gap-8">
                    {article.category.slice(0, 2).map((tag, idx) => (
                      <div key={idx} className={cx('tags', 'subtitle', 'bg-2', 'mb-16')}>
                        {tag.name}
                      </div>
                    ))}
                  </div>
                  <div className={cx('article-title', 'mb-16')}>
                    <h6>{article.name}</h6>
                  </div>
                  <div className={cx('cus-arrow-btn')}>
                    Read More
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M0.00390625 10.0019C0.00390625 11.3509 1.09765 12.4447 2.44666 12.4447H12.2812L9.98864 15.1439C9.11475 16.1723 9.24116 17.7131 10.2696 18.587C10.7288 18.9778 11.2906 19.1671 11.8494 19.1671C12.5419 19.1671 13.2296 18.8746 13.7126 18.3061L19.4231 11.5824C20.1975 10.6712 20.1975 9.33078 19.4231 8.42025L13.7126 1.69659C12.8387 0.668189 11.298 0.542387 10.2696 1.41628C9.24116 2.29017 9.11475 3.83094 9.98864 4.85933L12.2812 7.55857H2.44666C1.09765 7.55857 0.00390625 8.65231 0.00390625 10.0019Z"
                        fill="#EA982B"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
