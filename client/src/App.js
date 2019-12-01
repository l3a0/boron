import React, { Component } from 'react';
import getWeb3, { getGanacheWeb3 } from './utils/getWeb3';
import Header from './components/Header/index.js';
import Hero from './components/Hero/index.js';
import Instructions from './components/Instructions/index.js';

import { solidityLoaderOptions } from '../config/webpack';

import styles from './App.module.scss';

class App extends Component {
  state = {
    web3: null,
    accounts: null,
    // compoundUsd: null,
    route: window.location.pathname.replace('/', ''),
  };

  getGanacheAddresses = async () => {
    if (!this.ganacheProvider) {
      this.ganacheProvider = getGanacheWeb3();
    }
    if (this.ganacheProvider) {
      return await this.ganacheProvider.eth.getAccounts();
    }
    return [];
  };

  componentDidMount = async () => {
    const hotLoaderDisabled = solidityLoaderOptions.disabled;
    // let compoundUsdAbi = {};
    try {
      // compoundUsdAbi = require('../../contracts/cusdc.json');
    } catch (e) {
      console.log(e);
    }
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      let ganacheAccounts = [];
      try {
        ganacheAccounts = await this.getGanacheAddresses();
      } catch (e) {
        console.log('Ganache is not running');
      }
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const networkType = await web3.eth.net.getNetworkType();
      const isMetaMask = web3.currentProvider.isMetaMask;
      let balance = accounts.length > 0 ? await web3.eth.getBalance(accounts[0]) : web3.utils.toWei('0');
      balance = web3.utils.fromWei(balance, 'ether');
      
      this.setState({
        web3,
        ganacheAccounts,
        accounts,
        balance,
        networkId,
        networkType,
        hotLoaderDisabled,
        isMetaMask,
      });

      let compoundUsd = null;
      // let compoundUsd = new web3.eth.Contract(JSON.parse(compoundUsdAbi.result), '0x39aa39c021dfbae8fac545936693ac917d5e7563');
      if (compoundUsd) {
        // var options = {                               
        //   fromBlock: 0,     
        //   toBlock: 'latest'
        // };

        // var allLiquidateBorrowEvents = await compoundUsd.getPastEvents('LiquidateBorrow', options);

        this.setState({
          web3,
          ganacheAccounts,
          accounts,
          balance,
          networkId,
          networkType,
          hotLoaderDisabled,
          isMetaMask,
          // compoundUsd,
          // allLiquidateBorrowEvents,
        });
      } else {
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(`Failed to load web3, accounts, or contract. Check console for details.`);
      console.error(error);
    }
  };

  renderUnhealthyAccounts() {
    return (
      <div className={styles.wrapper}>
        <Hero />
        <Instructions name="unhealthyAccounts" {...this.state} />
      </div>
    );
  }

  renderLiquidations() {
    return (
      <div className={styles.wrapper}>
        <Hero />
        <Instructions name="liquidations" {...this.state} />
      </div>
    );
  }

  renderFAQ() {
    return (
      <div className={styles.wrapper}>
        <Instructions name="faq" {...this.state} />
      </div>
    );
  }

  render() {
    return (
      <div className={styles.App}>
        <Header />
        {this.state.route === '' && this.renderUnhealthyAccounts()}
        {this.state.route === 'liquidations' && this.renderLiquidations()}
      </div>
    );
  }
}

export default App;
