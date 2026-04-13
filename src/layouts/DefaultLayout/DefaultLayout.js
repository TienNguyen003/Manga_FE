import React from 'react';
import Header from '~/layouts/Header/Header';
import Footer from '~/layouts/Footer/footer';

export default function DefaultLayout({ children }) {
  return (
    <div>
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
}
