import React, { Component } from 'react';
import getWeb3, { getGanacheWeb3 } from './utils/getWeb3';
import Header from './components/Header/index.js';
import Hero from './components/Hero/index.js';
import Liquidations from './components/Liquidations/index.js';
import Bot from './components/Bot/index.js';
import UnhealthyAccounts from './components/UnhealthyAccounts/index.js';
import { solidityLoaderOptions } from '../config/webpack';
import styles from './App.module.scss';

class App extends Component {
  state = {
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
        <UnhealthyAccounts {...this.state} />
      </div>
    );
  }

  renderLiquidations() {
    return (
      <div className={styles.wrapper}>
        <Hero />
        <Liquidations {...this.state} />
      </div>
    );
  }

  renderBot() {
    return (
      <div className={styles.wrapper}>
        <Hero />
        <Bot {...this.state} />
      </div>
    );
  }

  render() {
    return (
      <div className={styles.App}>
        <Header />
        {this.state.route === '' && this.renderUnhealthyAccounts()}
        {this.state.route === 'liquidations' && this.renderLiquidations()}
        {this.state.route === 'bot' && this.renderBot()}
      </div>
    );
  }
}

export default App;
