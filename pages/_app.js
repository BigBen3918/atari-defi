import '../styles/globals.css';
import '../styles/bootstrap.min.css';
import React, {Fragment} from 'react';
import Navigation from '../components/layout/navbar';

function MyApp({ Component, pageProps }) {
  return (
    <Fragment>
      <Navigation />
      <Component {...pageProps} />
    </Fragment>
  )
}

export default MyApp
