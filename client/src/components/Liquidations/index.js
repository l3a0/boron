import React, { Component } from 'react';
import NumberFormat from 'react-number-format';
import Plot from 'react-plotly.js';
import styles from './Liquidations.module.scss';
import getWeb3 from '../../utils/getWeb3';

export default class Liquidations extends Component {
  state = {};

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
        let blocksRetrieved = 0;
        let dailyRevenue = {};
        let liquidatorsByRevenue = {};
        let liquidatedBorrowersByRevenue = {};
        liquidations.forEach(liquidation => {
          this.calculateRevenue(liquidation);
          totalRevenue += liquidation.revenue;
          let repayAmount = (liquidation.returnValues['repayAmount'] / 10 ** 6);
          totalLiquidation += repayAmount;
          distinctLiquidators.add(liquidation.returnValues['liquidator']);
          distinctBorrowers.add(liquidation.returnValues['borrower']);
          this.calculateLiquidatorsByRevenue(liquidation, liquidatorsByRevenue);
          this.calculateLiquidatedBorrowersByRevenue(liquidation, liquidatedBorrowersByRevenue);
          web3.eth.getBlock(liquidation.blockNumber, (error, block) => {
            blocksRetrieved++;
            liquidation.timestamp = block.timestamp;
            liquidation.timestampISO = (new Date(block.timestamp * 1000)).toISOString();
            // wait for all blocks to be retrieved.
            if (blocksRetrieved === liquidations.length) {
              dailyRevenue = liquidations.reduce(function(acc, cur) {
                let date = cur.timestampISO.substring(0, 10);
                acc[date] = (acc[date] || 0) + cur.revenue;
                return acc;
              }, {});
              // trigger ui update once after all blocks have been retrieved
              // to avoid degrading performance.
              this.setState({
                liquidations: liquidations,
                dailyRevenue: dailyRevenue,
              });
            }
          });
        });
        liquidatorsByRevenue = Object.values(liquidatorsByRevenue).sort((a, b) => b.revenue - a.revenue);
        liquidatedBorrowersByRevenue = Object.values(liquidatedBorrowersByRevenue).sort((a, b) => b.revenue - a.revenue);
        let top10LiquidatedBorrowersByRevenue = liquidatedBorrowersByRevenue.slice(0, 10);
        top10LiquidatedBorrowersByRevenue = [
          top10LiquidatedBorrowersByRevenue.map(x => x.address),
          top10LiquidatedBorrowersByRevenue.map(x => x.revenue.toFixed(2)),
          top10LiquidatedBorrowersByRevenue.map(x => x.txCount),
        ];
        let top10LiquidatorsByRevenue = liquidatorsByRevenue.slice(0, 10);
        top10LiquidatorsByRevenue = [
          top10LiquidatorsByRevenue.map(x => x.address),
          top10LiquidatorsByRevenue.map(x => x.revenue.toFixed(2)),
          top10LiquidatorsByRevenue.map(x => x.txCount),
        ];
        this.setState({
          liquidations: liquidations,
          totalLiquidation: totalLiquidation,
          totalRevenue: totalRevenue,
          distinctLiquidators: distinctLiquidators,
          distinctBorrowers: distinctBorrowers,
          liquidatorsByRevenue: liquidatorsByRevenue,
          top10LiquidatorsByRevenue: top10LiquidatorsByRevenue,
          liquidatedBorrowersByRevenue: liquidatedBorrowersByRevenue,
          top10LiquidatedBorrowersByRevenue: top10LiquidatedBorrowersByRevenue,
        });
      }
      catch (error) {
        console.log(error);
      }
    }
  }

  calculateLiquidatorsByRevenue(liquidation, liquidatorsByRevenue) {
    let liquidator = {};
    liquidator.address = liquidation.returnValues['liquidator'];
    liquidator.revenue = liquidation.revenue;
    liquidator.txCount = 1;
    if (liquidatorsByRevenue[liquidator.address]) {
      liquidatorsByRevenue[liquidator.address].revenue += liquidation.revenue;
      liquidatorsByRevenue[liquidator.address].txCount++;
    }
    else {
      liquidatorsByRevenue[liquidator.address] = liquidator;
    }
  }

  calculateLiquidatedBorrowersByRevenue(liquidation, liquidatedBorrowersByRevenue) {
    let borrower = {};
    borrower.address = liquidation.returnValues['borrower'];
    borrower.revenue = liquidation.revenue;
    borrower.txCount = 1;
    if (liquidatedBorrowersByRevenue[borrower.address]) {
      liquidatedBorrowersByRevenue[borrower.address].revenue += liquidation.revenue;
      liquidatedBorrowersByRevenue[borrower.address].txCount++;
    }
    else {
      liquidatedBorrowersByRevenue[borrower.address] = borrower;
    }
  }

  calculateRevenue(liquidation) {
    // Prices are in USD ($).
    const addressToSymbolMap = {
      '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5': {'symbol': 'cETH', 'price': 3.0154},
      '0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1': {'symbol': 'cREP', 'price': 0.2126},
      '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E': {'symbol': 'cBAT', 'price': 0.0039},
      '0xF5DCe57282A584D2746FaF1593d3121Fcac444dC': {'symbol': 'cSAI', 'price': 0.0211},
      '0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407': {'symbol': 'cZRX', 'price': 0.0051},
      '0xC11b1268C1A384e55C48c2391d8d480264A3A7F4': {'symbol': 'cWBTC', 'price': 148.3473},
      '0x39aa39c021dfbae8fac545936693ac917d5e7563': {'symbol': 'cUSDC', 'price': 0.0209},
      '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643': {'symbol': 'cDAI', 'price': 0.0},
    }
    const cTokenAddress = liquidation.returnValues['cTokenCollateral'];
    liquidation.symbol = addressToSymbolMap[cTokenAddress].symbol;
    const price = addressToSymbolMap[cTokenAddress].price;
    const seizeTokens = liquidation.returnValues['seizeTokens'] / 10 ** 8;
    // Liquidation incentive is 1.05.
    // seizeTokens = x * 1.05
    // x = seizeTokens / 1.05
    // revenue = seizeTokens - x
    // revenue = seizeTokens - (seizeTokens / 1.05)
    const liquidationIncentive = 1.05;
    liquidation.revenue = seizeTokens - (seizeTokens / liquidationIncentive);
    liquidation.revenue = liquidation.revenue * price;
  }

  renderLiquidations() {
    if (this.state.liquidations && this.state.dailyRevenue) {
      return (
        <div className={styles.instructions}>
          <h1> Browse USDC Liquidations </h1>
          <Plot
            data={[
              {
                x: Object.keys(this.state.dailyRevenue),
                y: Object.values(this.state.dailyRevenue),
                type: 'scatter',
              },
            ]}
            layout={{
              title: 'USDC Liquidation Revenue',
              yaxis: {
                title: 'Revenue ($)'
              },
            }}
          />
          <Plot
            data={[
              {
                x: this.state.liquidations.map(liquidation => liquidation.revenue),
                type: 'histogram',
              },
            ]}
            layout={{
              title: 'USDC Liquidation Revenue Distribution',
              yaxis: {
                title: 'Count'
              },
              xaxis: {
                title: 'Revenue ($500 bins)'
              },
            }}
          />
          <Plot
            data={[
              {
                type: 'table',
                columnwidth: [4,1,1],
                header: {
                  values: [["<b>Liquidator</b>"], ["<b>Revenue</b>"], ["<b>TX Count</b>"]],
                  align: ["left", "right"],
                },
                cells: {
                  values: this.state.top10LiquidatorsByRevenue,
                  align: ["left", "right"],
                  font: {family: "Consolas"},
                },
              },
            ]}
            layout={{
              title: 'Top 10 Liquidators by Revenue',
            }}
          />
          <Plot
            data={[
              {
                x: this.state.liquidatorsByRevenue.map(liquidator => liquidator.revenue),
                type: 'histogram',
              },
            ]}
            layout={{
              title: 'Liquidator Revenue Distribution',
              yaxis: {
                title: 'Count'
              },
              xaxis: {
                title: 'Revenue ($4900 bins)'
              },
            }}
          />
          <Plot
            data={[
              {
                type: 'table',
                columnwidth: [4,1,1],
                header: {
                  values: [["<b>Borrower</b>"], ["<b>Revenue</b>"], ["<b>TX Count</b>"]],
                  align: ["left", "right"],
                },
                cells: {
                  values: this.state.top10LiquidatedBorrowersByRevenue,
                  align: ["left", "right"],
                  font: {family: "Consolas"},
                },
              },
            ]}
            layout={{
              title: 'Top 10 Liquidated Borrowers by Revenue',
            }}
          />
          <Plot
            data={[
              {
                x: this.state.liquidatedBorrowersByRevenue.map(borrower => borrower.revenue),
                type: 'histogram',
              },
            ]}
            layout={{
              title: 'Liquidated Borrower Revenue Distribution',
              yaxis: {
                title: 'Count'
              },
              xaxis: {
                title: 'Revenue ($1990 bins)'
              },
            }}
          />
          <table>
            <thead>
              <tr>
                <th>Time</th>
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
                <td>Count: <NumberFormat value={this.state.liquidations.length} displayType={'text'} thousandSeparator={true} /></td>
                <td>Distinct: <NumberFormat value={this.state.distinctLiquidators.size} displayType={'text'} thousandSeparator={true} /></td>
                <td>Distinct: <NumberFormat value={this.state.distinctBorrowers.size} displayType={'text'} thousandSeparator={true} /></td>
                <td align="right">Sum: <NumberFormat value={this.state.totalLiquidation.toFixed(2)} displayType={'text'} thousandSeparator={true} /></td>
                <td align="right">Sum: <NumberFormat value={this.state.totalRevenue.toFixed(2)} displayType={'text'} thousandSeparator={true} /></td>
                <td></td>
                <td></td>
              </tr>
              {this.state.liquidations.map((value, index) => {
                return (
                  <tr key={value.id}>
                    <td>{value.timestampISO}</td>
                    <td>{value.blockNumber}</td>
                    <td>{value.returnValues['liquidator']}</td>
                    <td>{value.returnValues['borrower']}</td>
                    <td align="right"><NumberFormat value={(value.returnValues['repayAmount'] / 10**6).toFixed(6)} displayType={'text'} thousandSeparator={true} /></td>
                    <td align="right"><NumberFormat value={value.revenue.toFixed(6)} displayType={'text'} thousandSeparator={true} /></td>
                    <td align="right"><NumberFormat value={(value.returnValues['seizeTokens'] / 10**8).toFixed(6)} displayType={'text'} thousandSeparator={true} /></td>
                    <td>{value.symbol}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
