import React, { Component } from 'react';
import getWeb3, { getGanacheWeb3 } from './utils/getWeb3';
import Header from './components/Header/index.js';
import Footer from './components/Footer/index.js';
import Hero from './components/Hero/index.js';
import Instructions from './components/Instructions/index.js';

import { solidityLoaderOptions } from '../config/webpack';

import styles from './App.module.scss';

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null,
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
      let instance = null;
      let instanceWallet = null;
      if (instance || instanceWallet) {
        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        this.setState(
          {
            web3,
            ganacheAccounts,
            accounts,
            balance,
            networkId,
            networkType,
            hotLoaderDisabled,
            isMetaMask,
            contract: instance,
            wallet: instanceWallet,
          },
          () => {
            this.refreshValues(instance, instanceWallet);
            setInterval(() => {
              this.refreshValues(instance, instanceWallet);
            }, 5000);
          },
        );
      } else {
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
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(`Failed to load web3, accounts, or contract. Check console for details.`);
      console.error(error);
    }
  };

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  refreshValues = (instance, instanceWallet) => {
    if (instance) {
      this.getCount();
    }
    if (instanceWallet) {
      this.updateTokenOwner();
    }
  };

  renderInstructions() {
    return (
      <div className={styles.wrapper}>
        <Hero />
        <Instructions ganacheAccounts={this.state.ganacheAccounts} name="setup" accounts={this.state.accounts} />
      </div>
    );
  }

  renderFAQ() {
    return (
      <div className={styles.wrapper}>
        <Instructions ganacheAccounts={this.state.ganacheAccounts} name="faq" accounts={this.state.accounts} />
      </div>
    );
  }

  render() {
    return (
      <div className={styles.App}>
        <Header />
        {this.state.route === '' && this.renderInstructions()}
        {this.state.route === 'faq' && this.renderFAQ()}
        <Footer />
      </div>
    );
  }
}

export default App;
