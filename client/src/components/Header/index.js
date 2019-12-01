import React from 'react';
import styles from './header.module.scss';

const Header = () => (
  <div className={styles.header}>
    <nav id="menu" className="menu">
      <div className={styles.brand}>
        <a href="/" className={styles.link}>
        </a>
      </div>
      <ul>
        <li>
          <a href="/" className={styles.link}>
            {' '}
            Browse Accounts
          </a>
        </li>
        <li>
          <a href="/liquidations" className={styles.link}>
            {' '}
            Browse Liquidations
          </a>
        </li>
      </ul>
    </nav>
  </div>
);

export default Header;
