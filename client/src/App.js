import React, { Component } from 'react';
import getWeb3, { getGanacheWeb3 } from './utils/getWeb3';

import CUSDCABI from './abis/cusdc.json';
import CDAIABI from './abis/cdai.json';
import CETHABI from './abis/ceth.json';
import CREPABI from './abis/crep.json';
import CBATABI from './abis/cbat.json';
import CSAIABI from './abis/csai.json';
import CZRXABI from './abis/czrx.json';
import CWBTCABI from './abis/cwbtc.json';

import Header from './components/Header/index.js';
import Hero from './components/Hero/index.js';
import Liquidations from './components/Liquidations/index.js';
import BotControlPanel from './components/BotControlPanel/index.js';
import UnhealthyAccounts from './components/UnhealthyAccounts/index.js';
import { solidityLoaderOptions } from '../config/webpack';
import styles from './App.module.scss';

class App extends Component {
  state = {
    route: window.location.pathname.replace('/', ''),
  };

  async getGanacheAddresses() {
    if (!this.ganacheProvider) {
      this.ganacheProvider = getGanacheWeb3();
    }
    if (this.ganacheProvider) {
      return await this.ganacheProvider.eth.getAccounts();
    }
    return [];
  };

  async componentDidMount() {
    const hotLoaderDisabled = solidityLoaderOptions.disabled;

    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      const tokenContracts = [
        this.getContract(web3, CUSDCABI, '0x39aa39c021dfbae8fac545936693ac917d5e7563'),
        this.getContract(web3, CDAIABI, '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643'),
        this.getContract(web3, CETHABI, '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5'),
        this.getContract(web3, CREPABI, '0x158079ee67fce2f58472a96584a73c7ab9ac95c1'),
        this.getContract(web3, CBATABI, '0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e'),
        this.getContract(web3, CSAIABI, '0xf5dce57282a584d2746faf1593d3121fcac444dc'),
        this.getContract(web3, CZRXABI, '0xb3319f5d18bc0d84dd1b4825dcde5d5f7266d407'),
        this.getContract(web3, CWBTCABI, '0xc11b1268c1a384e55c48c2391d8d480264a3a7f4'),
      ];

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
        tokenContracts,
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(`Failed to load web3, accounts, or contract. Check console for details.`);
      console.error(error);
    }
  };

  getContract(web3, abi, address) {
    const contract = new web3.eth.Contract(JSON.parse(abi.result), address);

    return contract
  }

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
        <BotControlPanel {...this.state} />
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
