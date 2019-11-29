import React from 'react';
import styles from './header.module.scss';
import logo from './stater-kits-logo.png';

const Header = () => (
  <div className={styles.header}>
    <nav id="menu" className="menu">
      <div className={styles.brand}>
        <a href="/" className={styles.link}>
          {' '}
          {<img src={logo} alt="logo" />}
        </a>
      </div>
      <ul>
        <li>
          <a href="/" className={styles.link}>
            {' '}
            Setup
          </a>
        </li>
        <li>
          <a href="/counter" className={styles.link}>
            {' '}
            Counter
          </a>
        </li>
        <li>
          <a href="/evm" className={styles.link}>
            {' '}
            EVM Packages
          </a>
        </li>
        <li>
          <a href="/faq" className={styles.link}>
            {' '}
            FAQ
          </a>
        </li>
      </ul>
    </nav>
  </div>
);

export default Header;
