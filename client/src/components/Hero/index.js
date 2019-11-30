import React, { Component } from 'react';
import styles from './Hero.module.scss';
import cx from 'classnames';
import logos from './pic_bg.png';

export default class Hero extends Component {
  renderLogo(name, imgUrl) {
    return (
      <div className={cx(styles.logo, styles[name])}>
        <img alt="zeppelin" className="logo-img" src={imgUrl} />
      </div>
    );
  }
  render() {
    return (
      <div className={styles.Hero}>
        <div className={styles.hwrapper}>
          <div className={styles.left}>
            <h1> Welcome to Compound Liquidator! </h1>
            <h2>Browse and liquidate underwater accounts.</h2>
            <div className={styles.sellingpoints}>
              <div className={styles.feature}>
              </div>
            </div>
            <div className={styles.ctas}>
              <a className={styles.mainLink} target="_blank" rel="noopener noreferrer" href="https://github.com/l3a0/boron">
                > View code on github
              </a>
            </div>
          </div>
          <div className={styles.right}>
            <img alt="Starter Kit Tutorial" src={logos} />
          </div>
        </div>
      </div>
    );
  }
}
