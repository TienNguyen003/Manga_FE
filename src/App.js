import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { publicRoutes } from '~/routes';
import classNames from 'classnames/bind';

import '~/components/LibaralyLayout/grid.css';
import styles from './App.module.scss';
import Header from './layouts/Header/Header';
import Footer from './layouts/Footer/footer';
import Error from './components/404/404';
import { UserProvider } from '~/providers/UserContext';

const cx = classNames.bind(styles);

function AppContent() {
  const location = useLocation();
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    setRouteLoading(true);
    const timer = setTimeout(() => {
      setRouteLoading(false);
    }, 650);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  const isValidPath = (path) => {
    return publicRoutes.some((route) => {
      const regex = new RegExp(`^${route.path.replace(/:\w+/g, '[^/]+')}$`);
      return regex.test(path);
    });
  };

  const showLayout = isValidPath(location.pathname);

  return (
    <>
      {routeLoading && (
        <div className={cx('routeLoader')}>
          <div className={cx('routeLoaderBar')} />
          <div className={cx('routeLoaderCenter')}>
            <div className={cx('routeLoaderSpinner')} />
            <p className={cx('routeLoaderText')}>Đang chuyển trang...</p>
          </div>
        </div>
      )}

      {showLayout && <Header />}
      <div className="App">
        <Routes>
          {publicRoutes.map((route, index) => {
            const Page = route.component;

            return <Route key={index} path={route.path} element={<Page />} />;
          })}
          <Route path="*" element={<Error />} />
        </Routes>
      </div>
      {showLayout && <Footer />}
    </>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <UserProvider>
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
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;
