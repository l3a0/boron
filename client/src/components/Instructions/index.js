import React, { Component } from 'react';
import { Table } from 'rimble-ui';
import styles from './Instructions.module.scss';
import getWeb3 from '../../utils/getWeb3';
import NumberFormat from 'react-number-format';

export default class Instructions extends Component {
  state = {
    accountResponse: null,
    liquidations: null,
  };

  async componentDidMount() {
    const { name } = this.props;
    switch (name) {
      case 'unhealthyAccounts':
        await this.loadUnhealthyAccounts();
        break;
      case 'liquidations':
        await this.loadLiquidations();
        break;
      default:
        this.loadUnhealthyAccounts();
        break;
    }
  }
  
  async loadLiquidations() {
    const web3 = await getWeb3();
    let compoundUsdAbi = require('../../../../contracts/cusdc.json');
    // Implies only liquidations of Compound USDC debt are retrieved.
    let compoundUsd = new web3.eth.Contract(JSON.parse(compoundUsdAbi.result), '0x39aa39c021dfbae8fac545936693ac917d5e7563');
    if (compoundUsd) {
      let options = {
        fromBlock: 0,
        toBlock: 'latest'
      };
      try {
        // In theory options parameter is optional. In practice an empty array is
        // returned if options is not provided with fromBlock and toBlock set.
        let liquidations = await compoundUsd.getPastEvents('LiquidateBorrow', options);
        // Prices are in USD ($).
        const addressToSymbolMap = {
          '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5': {'symbol': 'cETH', 'price': 3.0154},
          '0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1': {'symbol': 'cREP', 'price': 0.2126},
          '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E': {'symbol': 'cBAT', 'price': 0.0039},
          '0xF5DCe57282A584D2746FaF1593d3121Fcac444dC': {'symbol': 'cSAI', 'price': 0.0211},
          '0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407': {'symbol': 'cZRX', 'price': 0.0051},
          '0xC11b1268C1A384e55C48c2391d8d480264A3A7F4': {'symbol': 'cWBTC', 'price': 148.3473},
        }
        liquidations.forEach(element => {
          element.symbol = addressToSymbolMap[element.returnValues['cTokenCollateral']].symbol;
          element.revenue = addressToSymbolMap[element.returnValues['cTokenCollateral']].price * (element.returnValues['seizeTokens'] / 10**8);
        });
        const totalLiquidation = this.calculateTotalLiquidation(liquidations);
        const totalRevenue = this.calculateTotalRevenue(liquidations);
        this.setState({ liquidations: liquidations, totalLiquidation: totalLiquidation, totalRevenue: totalRevenue });
      }
      catch (error) {
        console.log(error);
      }
    }
  }

  calculateTotalLiquidation(liquidations) {
    const sum = (accumulator, currentValue) => {
      let repayAmount = (currentValue.returnValues['repayAmount'] / 10 ** 6);
      return accumulator + repayAmount;
    };
    return liquidations.reduce(sum, 0);
  }

  calculateTotalRevenue(liquidations) {
    const sum = (accumulator, currentValue) => {
      return accumulator + currentValue.revenue;
    };
    return liquidations.reduce(sum, 0);
  }

  async loadUnhealthyAccounts() {
    let url = new URL('https://api.compound.finance/api/v2/account');
    let params = {
      "max_health[value]": "1.0",
    };
    url.search = new URLSearchParams(params).toString();
    try {
      // Call the fetch function passing the url of the API as a parameter
      let response = await fetch(url);
      // Your code for handling the data you get from the API
      // TODO: Filter by token.
      let data = await response.json();
      this.setState({ accountResponse: data });
    }
    catch (e) {
      // This is where you run code if the server returns any errors
      console.log(e);
    }
  }

  renderUnhealthyAccounts() {
    if (this.state.accountResponse) {
      return (
        <div className={styles.instructions}>
          <h1> Browse Unhealthy Accounts </h1>
          <Table width="2">
            <thead>
              <tr>
                <th>Address</th>
                <th>Health</th>
                <th>Borrow Value (Ξ)</th>
                <th>Collateral Value (Ξ)</th>
              </tr>
            </thead>
            <tbody>
              {this.state.accountResponse.accounts.map((value, index) => {
                return (
                  <tr>
                    <td>{value.address}</td>
                    <td>{value.health.value.slice(0, 10)}</td>
                    <td>{value.total_borrow_value_in_eth.value.slice(0, 10)}</td>
                    <td>{value.total_collateral_value_in_eth.value.slice(0, 10)}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      );
    }

    return (
      <div className={styles.instructions}>
        <h1> Browse Unhealthy Accounts </h1>
      </div>
    );
  }

  renderLiquidations() {
    if (this.state.liquidations) {
      return (
        <div className={styles.instructions}>
          <h1> Browse USDC Liquidations </h1>
          <Table width="2">
            <thead>
              <tr>
                <th>Block #</th>
                <th>Liquidator</th>
                <th>Borrower</th>
                <th>Repay Amount (USDC)</th>
                <th>Revenue ($)</th>
                <th>Revenue (cToken)</th>
                <th>cToken</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td><NumberFormat value={this.state.totalLiquidation} displayType={'text'} thousandSeparator={true} /></td>
                <td><NumberFormat value={this.state.totalRevenue} displayType={'text'} thousandSeparator={true} /></td>
                <td></td>
              </tr>
              {this.state.liquidations.map((value, index) => {
                return (
                  <tr>
                    <td>{value.blockNumber}</td>
                    <td>{value.returnValues['liquidator']}</td>
                    <td>{value.returnValues['borrower']}</td>
                    <td><NumberFormat value={value.returnValues['repayAmount'] / 10**6} displayType={'text'} thousandSeparator={true} /></td>
                    <td><NumberFormat value={value.revenue} displayType={'text'} thousandSeparator={true} /></td>
                    <td><NumberFormat value={value.returnValues['seizeTokens'] / 10**8} displayType={'text'} thousandSeparator={true} /></td>
                    <td>{value.symbol}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      );
    }

    return (
      <div className={styles.instructions}>
        <h1> Browse USDC Liquidations </h1>
      </div>
    );
  }

  render() {
    const { name } = this.props;
    switch (name) {
      case 'unhealthyAccounts':
        return this.renderUnhealthyAccounts();
      case 'liquidations':
          return this.renderLiquidations();
      default:
        return this.renderUnhealthyAccounts();
    }
  }
}
