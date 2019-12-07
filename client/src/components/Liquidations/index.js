import React, { Component } from 'react';
import { Table } from 'rimble-ui';
import styles from './Liquidations.module.scss';
import getWeb3 from '../../utils/getWeb3';
import NumberFormat from 'react-number-format';

export default class Liquidations extends Component {
  state = {
    liquidations: null,
  };

  async componentDidMount() {
    await this.loadLiquidations();
  }
  
  async loadLiquidations() {
    const web3 = await getWeb3();
    let compoundUsdAbi = require('../../../../contracts/cusdc.json');
    // Implies only liquidations of Compound USDC debt are retrieved.
    let compoundUsd = new web3.eth.Contract(JSON.parse(compoundUsdAbi.result), '0x39aa39c021dfbae8fac545936693ac917d5e7563');
    if (compoundUsd) {
      let options = {
        fromBlock: 0,
        toBlock: 'latest',
      };
      try {
        // In theory options parameter is optional. In practice an empty array is
        // returned if options is not provided with fromBlock and toBlock set.
        let liquidations = await compoundUsd.getPastEvents('LiquidateBorrow', options);
        let totalLiquidation = 0;
        let totalRevenue = 0;
        let distinctLiquidators = new Set();
        let distinctBorrowers = new Set();
        liquidations.forEach(element => {
          this.calculateRevenue(element);
          totalRevenue += element.revenue;
          let repayAmount = (element.returnValues['repayAmount'] / 10 ** 6);
          totalLiquidation += repayAmount;
          distinctLiquidators.add(element.returnValues['liquidator']);
          distinctBorrowers.add(element.returnValues['borrower']);
        });
        this.setState({
          liquidations: liquidations,
          totalLiquidation: totalLiquidation,
          totalRevenue: totalRevenue,
          distinctLiquidators: distinctLiquidators,
          distinctBorrowers: distinctBorrowers,
        });
      }
      catch (error) {
        console.log(error);
      }
    }
  }

  calculateRevenue(element) {
    // Prices are in USD ($).
    const addressToSymbolMap = {
      '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5': {'symbol': 'cETH', 'price': 3.0154},
      '0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1': {'symbol': 'cREP', 'price': 0.2126},
      '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E': {'symbol': 'cBAT', 'price': 0.0039},
      '0xF5DCe57282A584D2746FaF1593d3121Fcac444dC': {'symbol': 'cSAI', 'price': 0.0211},
      '0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407': {'symbol': 'cZRX', 'price': 0.0051},
      '0xC11b1268C1A384e55C48c2391d8d480264A3A7F4': {'symbol': 'cWBTC', 'price': 148.3473},
    }
    const cTokenAddress = element.returnValues['cTokenCollateral'];
    element.symbol = addressToSymbolMap[cTokenAddress].symbol;
    const price = addressToSymbolMap[cTokenAddress].price;
    const seizeTokens = element.returnValues['seizeTokens'] / 10 ** 8;
    // Liquidation incentive is 1.05.
    // seizeTokens = x * 1.05
    // x = seizeTokens / 1.05
    // revenue = seizeTokens - x
    // revenue = seizeTokens - (seizeTokens / 1.05)
    const liquidationIncentive = 1.05;
    element.revenue = seizeTokens - (seizeTokens / liquidationIncentive);
    element.revenue = element.revenue * price;
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
                <td>Count: <NumberFormat value={this.state.liquidations.length} displayType={'text'} thousandSeparator={true} /></td>
                <td>Distinct: <NumberFormat value={this.state.distinctLiquidators.size} displayType={'text'} thousandSeparator={true} /></td>
                <td>Distinct: <NumberFormat value={this.state.distinctBorrowers.size} displayType={'text'} thousandSeparator={true} /></td>
                <td>Sum: <NumberFormat value={this.state.totalLiquidation} displayType={'text'} thousandSeparator={true} /></td>
                <td>Sum: <NumberFormat value={this.state.totalRevenue} displayType={'text'} thousandSeparator={true} /></td>
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
    return this.renderLiquidations();
  }
}
