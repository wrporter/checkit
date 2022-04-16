import '@reach/menu-button/styles.css';
import '@reach/checkbox/styles.css';
import '@reach/dialog/styles.css';
import '@reach/tooltip/styles.css';
import '../styles/global.css';

import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';

const MyApp = ({ Component, pageProps }: AppProps) => (
  <SessionProvider session={pageProps.session} refetchInterval={0}>
    <Component {...pageProps} />
  </SessionProvider>
);

export default MyApp;
