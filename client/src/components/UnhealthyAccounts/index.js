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
        '0x39aa39c021dfbae8fac545936693ac917d5e7563': {'symbol': 'cUSDC', 'price': 0.0208},
        '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643': {'symbol': 'cDAI', 'price': 0.0000},
        '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5': {'symbol': 'cETH', 'price': 3.0154},
        '0x158079ee67fce2f58472a96584a73c7ab9ac95c1': {'symbol': 'cREP', 'price': 0.2126},
        '0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e': {'symbol': 'cBAT', 'price': 0.0039},
        '0xf5dce57282a584d2746faf1593d3121fcac444dc': {'symbol': 'cSAI', 'price': 0.0211},
        '0xb3319f5d18bc0d84dd1b4825dcde5d5f7266d407': {'symbol': 'cZRX', 'price': 0.0051},
        '0xc11b1268c1a384e55c48c2391d8d480264a3a7f4': {'symbol': 'cWBTC', 'price': 148.3473},
      };
      data.accounts.forEach(account => {
        account.debt = [];
        account.collateral = [];
        account.tokens.forEach(token => {
          token.symbol = addressToSymbolMap[token.address].symbol;
          const borrowBalance = parseFloat(token.borrow_balance_underlying.value);
          if (borrowBalance > 0) {
            account.debt.push(token);
          }
          const supplyBalance = parseFloat(token.supply_balance_underlying.value);
          if (supplyBalance > 0) {
            account.collateral.push(token);
          }
        });
      });
      this.setState({ accountResponse: data });
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
                <th>Health</th>
                <th>Borrow Value (Ξ)</th>
                <th align="right">Debt</th>
                <th>Collateral Value (Ξ)</th>
                <th>Collateral</th>
              </tr>
            </thead>
            <tbody>
              {this.state.accountResponse.accounts.map((account) => {
                return (
                  <tr key={account.address}>
                    <td>{account.address}</td>
                    <td align="right">{parseFloat(account.health.value).toFixed(8)}</td>
                    <td align="right">{parseFloat(account.total_borrow_value_in_eth.value).toFixed(8)}</td>
                    <td align="right">
                      <ul>
                        {(account.debt.map((token) => {
                          const debt = parseFloat(token.borrow_balance_underlying.value).toFixed(8);
                          return (
                            <li key={token.address}>{token.symbol.substring(1) + ": " + debt}</li>
                          );
                        }))}
                      </ul>
                    </td>
                    <td align="right">{parseFloat(account.total_collateral_value_in_eth.value).toFixed(8)}</td>
                    <td align="right">
                      <ul>
                        {(account.collateral.map((token) => {
                          const collateral = parseFloat(token.supply_balance_underlying.value).toFixed(8);
                          return (
                            <li key={token.address}>{token.symbol.substring(1) + ": " + collateral}</li>
                          );
                        }))}
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
