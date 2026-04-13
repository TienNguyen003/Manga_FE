import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'; // <-- thêm
import classNames from 'classnames/bind';
import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { adminRoutes, privateRoutesNoHeader, publicRoutes } from '~/routes';

import '~/components/LibaralyLayout/grid.css';
import { UserProvider } from '~/providers/UserContext';
import styles from './App.module.scss';
import Error from './components/404/404';
import AdminLayout from './layouts/AdminLayout/AdminLayout';
import DefaultLayout from './layouts/DefaultLayout/DefaultLayout';

const cx = classNames.bind(styles);

// Theme MUI global
const theme = createTheme({
  typography: {
    fontFamily: '"Be Vietnam Pro", "Barlow", "Segoe UI", sans-serif',
    fontSize: '1.4rem',
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

      <div className="App">
        <Routes>
          {[...publicRoutes, ...privateRoutesNoHeader, ...adminRoutes].map((route, index) => {
            const Page = route.component;
            
            let Layout = React.Fragment; 
            if (route.layout === 'admin') {
               Layout = AdminLayout;
            } else if (route.layout === 'default') {
               Layout = DefaultLayout;
            }

            return (
              <Route 
                key={index} 
                path={route.path} 
                element={
                  <Layout>
                    <Page />
                  </Layout>
                } 
              />
            );
          })}
          <Route path="*" element={<Error />} />
        </Routes>
      </div>
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