import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { publicRoutes, privateRoutesNoHeader } from '~/routes';
import classNames from 'classnames/bind';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'; // <-- thêm

import '~/components/LibaralyLayout/grid.css';
import styles from './App.module.scss';
import Header from './layouts/Header/Header';
import Footer from './layouts/Footer/footer';
import Error from './components/404/404';
import { UserProvider } from '~/providers/UserContext';

const cx = classNames.bind(styles);

// Theme MUI global
const theme = createTheme({
  typography: {
    fontFamily: '"Be Vietnam Pro", "Barlow", "Segoe UI", sans-serif',
    fontSize: '1.4rem'
  },
});

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

  const noHeaderPaths = privateRoutesNoHeader.map((route) => route.path);
  const showLayout = !noHeaderPaths.includes(location.pathname);

  return (
    <>
      {routeLoading && (
        <div className={cx('routeLoader')}>
          <div className={cx('routeLoaderBar')} />
          <div className={cx('routeLoaderCenter')}>
            <div className={cx('routeLoaderSpinner')} />
            <p className={cx('routeLoaderText')}>Đang tải trang...</p>
          </div>
        </div>
      )}

      {showLayout && <Header />}

      <div className="App">
        <Routes>
          {[...publicRoutes, ...privateRoutesNoHeader].map((route, index) => {
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
      <ThemeProvider theme={theme}> {/* <-- bọc toàn bộ App */}
        <CssBaseline /> {/* <-- reset CSS cơ bản + áp font global */}
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
      </ThemeProvider>
    </UserProvider>
  );
}

export default App;