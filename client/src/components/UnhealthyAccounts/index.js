import React, { Component } from 'react';
import { Table } from 'rimble-ui';
import styles from './UnhealthyAccounts.module.scss';

export default class UnhealthyAccounts extends Component {
  state = {
    accountResponse: null,
  };

  async componentDidMount() {
    await this.loadUnhealthyAccounts();
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

  render() {
    return this.renderUnhealthyAccounts();
  }
}
