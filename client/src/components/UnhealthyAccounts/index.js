import React, { Component } from 'react';
import styles from './UnhealthyAccounts.module.scss';

export default class UnhealthyAccounts extends Component {
  state = {};

  async componentDidMount() {
    await this.loadUnhealthyAccounts();
  }

  async loadUnhealthyAccounts() {
    let url = new URL('https://api.compound.finance/api/v2/account');
    let params = {
      "max_health[value]": "1.0",
      "page_size": 100,
    };
    url.search = new URLSearchParams(params).toString();
    try {
      // Call the fetch function passing the url of the API as a parameter
      let response = await fetch(url);
      // Your code for handling the data you get from the API
      // TODO: Filter by token.
      let data = await response.json();
      // Prices are in USD ($).
      const addressToSymbolMap = {
        '0x39aa39c021dfbae8fac545936693ac917d5e7563': {'symbol': 'cUSDC', 'price': 0.0208, 'underlyingAssetToEthExchangeRate': 0.007067},
        '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643': {'symbol': 'cDAI', 'price': 0.0000, 'underlyingAssetToEthExchangeRate': 0.007071},
        '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5': {'symbol': 'cETH', 'price': 3.0154, 'underlyingAssetToEthExchangeRate': 1},
        '0x158079ee67fce2f58472a96584a73c7ab9ac95c1': {'symbol': 'cREP', 'price': 0.2126, 'underlyingAssetToEthExchangeRate': 0.070744},
        '0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e': {'symbol': 'cBAT', 'price': 0.0039, 'underlyingAssetToEthExchangeRate': 0.001297},
        '0xf5dce57282a584d2746faf1593d3121fcac444dc': {'symbol': 'cSAI', 'price': 0.0211, 'underlyingAssetToEthExchangeRate': 0.007129},
        '0xb3319f5d18bc0d84dd1b4825dcde5d5f7266d407': {'symbol': 'cZRX', 'price': 0.0051, 'underlyingAssetToEthExchangeRate': 0.001524},
        '0xc11b1268c1a384e55c48c2391d8d480264a3a7f4': {'symbol': 'cWBTC', 'price': 148.3473, 'underlyingAssetToEthExchangeRate': 50.753489},
      };
      const showUsd = true;
      const ethToUsd = 143.77;
      data.accounts.forEach(account => {
        account.debt = [];
        account.collateral = [];
        account.total_borrow_value_in_eth = parseFloat(account.total_borrow_value_in_eth.value);
        account.total_borrow_value_in_usd = account.total_borrow_value_in_eth * ethToUsd;
        account.max_liquidation_value_in_eth = account.total_borrow_value_in_eth * data.close_factor;
        account.max_liquidation_value_in_usd = account.max_liquidation_value_in_eth * ethToUsd;
        account.total_collateral_value_in_eth = parseFloat(account.total_collateral_value_in_eth.value);
        account.total_collateral_value_in_usd = account.total_collateral_value_in_eth * ethToUsd;
        account.total_debt_in_eth = 0;
        account.total_supply_in_eth = 0;
        account.tokens.forEach(token => {
          token.symbol = addressToSymbolMap[token.address].symbol;
          token.price = addressToSymbolMap[token.address].price;
          token.underlyingAssetToEthExchangeRate = addressToSymbolMap[token.address].underlyingAssetToEthExchangeRate;
          token.borrow_balance_underlying = parseFloat(token.borrow_balance_underlying.value);
          token.borrow_balance_underlying_in_eth = token.borrow_balance_underlying * addressToSymbolMap[token.address].underlyingAssetToEthExchangeRate;
          token.borrow_balance_underlying_in_usd = token.borrow_balance_underlying_in_eth * ethToUsd;
          account.total_debt_in_eth += token.borrow_balance_underlying_in_eth;
          token.supply_balance_underlying = parseFloat(token.supply_balance_underlying.value);
          token.supply_balance_underlying_in_eth = token.supply_balance_underlying * addressToSymbolMap[token.address].underlyingAssetToEthExchangeRate;
          token.supply_balance_underlying_in_usd = token.supply_balance_underlying_in_eth * ethToUsd;
          account.total_supply_in_eth += token.supply_balance_underlying_in_eth;
          if (token.borrow_balance_underlying > 0) {
            account.debt.push(token);
          }
          if (token.supply_balance_underlying > 0) {
            account.collateral.push(token);
          }
        });
        account.total_debt_in_usd = account.total_debt_in_eth * ethToUsd;
        account.total_supply_in_usd = account.total_supply_in_eth * ethToUsd;
        account.debt.sort((a, b) => b.borrow_balance_underlying_in_eth - a.borrow_balance_underlying_in_eth);
        account.collateral.sort((a, b) => b.supply_balance_underlying_in_eth - a.supply_balance_underlying_in_eth);
      });
      data.accounts.sort((a, b) => b.total_borrow_value_in_eth - a.total_borrow_value_in_eth);
      this.setState({
        accountResponse: data,
        ethToUsd: ethToUsd,
        showUsd: showUsd,
        currencySymbol: showUsd ? '$' : 'Ξ',
      });
      console.log(data);
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
          <table>
            <thead>
              <tr>
                <th>Address</th>
                <th align="right">Health</th>
                <th align="right">Borrow Value ({this.state.currencySymbol})</th>
                <th align="right">Max Liquidation Amount ({this.state.currencySymbol})</th>
                <th align="right">Debt</th>
                <th align="right">Debt ({this.state.currencySymbol})</th>
                <th align="right">Collateral Value ({this.state.currencySymbol})</th>
                <th align="right">Collateral</th>
                <th align="right">Collateral ({this.state.currencySymbol})</th>
                <th>Expected Transaction</th>
              </tr>
            </thead>
            <tbody>
              {this.state.accountResponse.accounts.map((account) => {
                return (
                  <tr key={account.address}>
                    <td>{account.address}</td>
                    <td align="right">{parseFloat(account.health.value).toFixed(8)}</td>
                    <td align="right">{this.state.showUsd ? account.total_borrow_value_in_usd.toFixed(8) : account.total_borrow_value_in_eth.toFixed(8)}</td>
                    <td align="right">{this.state.showUsd ? account.max_liquidation_value_in_usd.toFixed(8) : account.max_liquidation_value_in_eth.toFixed(8)}</td>
                    <td align="right">
                      <ul>
                        {(account.debt.map((token) => {
                          return (
                            <li key={token.address}>{token.symbol.substring(1) + ": " + token.borrow_balance_underlying.toFixed(8)}</li>
                          );
                        }))}
                      </ul>
                    </td>
                    <td align="right">
                      <ul>
                        {(account.debt.map((token) => {
                          return (
                            <li key={token.address}>{token.symbol.substring(1)}: {this.state.showUsd ? token.borrow_balance_underlying_in_usd.toFixed(8) : token.borrow_balance_underlying_in_eth.toFixed(8)}</li>
                          );
                        }))}
                        <li>Total: {this.state.showUsd ? account.total_debt_in_usd.toFixed(8) : account.total_debt_in_eth.toFixed(8)}</li>
                      </ul>
                    </td>
                    <td align="right">{(this.state.showUsd ? account.total_collateral_value_in_usd : account.total_collateral_value_in_eth).toFixed(8)}</td>
                    <td align="right">
                      <ul>
                        {(account.collateral.map((token) => {
                          return (
                            <li key={token.address}>{token.symbol.substring(1) + ": " + token.supply_balance_underlying.toFixed(8)}</li>
                          );
                        }))}
                      </ul>
                    </td>
                    <td align="right">
                      <ul>
                        {(account.collateral.map((token) => {
                          return (
                            <li key={token.address}>{token.symbol.substring(1)}: {this.state.showUsd ? token.supply_balance_underlying_in_usd.toFixed(8) : token.supply_balance_underlying_in_eth.toFixed(8)}</li>
                          );
                        }))}
                        <li>Total: {this.state.showUsd ? account.total_supply_in_usd.toFixed(8) : account.total_supply_in_eth.toFixed(8)}</li>
                      </ul>
                    </td>
                    <td>
                      <ul>
                        <li>Liquidate {(account.max_liquidation_value_in_eth / account.debt[0].underlyingAssetToEthExchangeRate).toFixed(8)} {account.debt[0].symbol.substring(1)} debt</li>
                        <li>Collect {(account.max_liquidation_value_in_eth > account.collateral[0].supply_balance_underlying_in_eth ? account.collateral[0].supply_balance_underlying : account.max_liquidation_value_in_eth * this.state.accountResponse.liquidation_incentive / account.collateral[0].underlyingAssetToEthExchangeRate).toFixed(8)} {account.collateral[0].symbol.substring(1)} collateral</li>
                      </ul>
                    </td>
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
        <h1> Browse Unhealthy Accounts </h1>
      </div>
    );
  }

  render() {
    return this.renderUnhealthyAccounts();
  }
}
