import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { publicRoutes } from '~/routes';
import classNames from 'classnames/bind';

import '~/components/LibaralyLayout/grid.css';
import styles from './App.module.scss';
import Header from './layouts/Header/Header';
import Footer from './layouts/Footer/footer';
import Error from './components/404/404';

const cx = classNames.bind(styles);

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const isValidPath = (path) => {
    return publicRoutes.some((route) => {
      const regex = new RegExp(`^${route.path.replace(/:\w+/g, '[^/]+')}$`);
      return regex.test(path);
    });
  };

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      {loading && (
        <div className={cx('preloader')}>
          <div id="preloader">
            <div className={cx('loader')}>
              <div className={cx('box1')}></div>
              <div className={cx('box2')}></div>
              <div className={cx('box3')}></div>
            </div>
          </div>
        </div>
      )}
      {isValidPath(window.location.pathname) && <Header />}
      <div className="App" style={{ minHeight: '100vh' }}>
        <Routes>
          {publicRoutes.map((route, index) => {
            const Page = route.component;

            return <Route key={index} path={route.path} element={<Page />} />;
          })}
          <Route path="*" element={<Error />} />
        </Routes>
      </div>
      {isValidPath(window.location.pathname) && <Footer />}
    </Router>
  );
}

export default App;
