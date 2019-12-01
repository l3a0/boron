import React, { Component } from 'react';
import { Table } from 'rimble-ui';
import styles from './Instructions.module.scss';

export default class Instructions extends Component {
  state = {
    accountResponse: null,
  };

  componentDidMount() {
    var url = new URL('https://api.compound.finance/api/v2/account');
    var params = {
      "max_health[value]": "1.0",
    }
    url.search = new URLSearchParams(params).toString();
    var component = this;
    // Call the fetch function passing the url of the API as a parameter
    fetch(url)
    .then((response) => response.json())
    .then(function(data) {
      // Your code for handling the data you get from the API
      component.setState({accountResponse: data});
    })
    .catch(function(error) {
      // This is where you run code if the server returns any errors
    });
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
          <h1> Browse Liquidations </h1>
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
        <h1> Browse Liquidations </h1>
      </div>
    );
  }

  renderFAQ() {
    return (
      <div className={styles.instructions}>
        <h2> FAQ </h2>
        <div className={styles.question}>Q: Why?</div>
        <div className={styles.separator} />
        <div className={styles.step}>
          <div className={styles.instruction}>
            1. Enable browsing accounts eligible for liquidation.
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.instruction}>
            2. Enable liquidating accounts.
          </div>
        </div>
        <div className={styles.question}>Q: What?</div>
        <div className={styles.separator} />
        <div className={styles.step}>
          <div className={styles.instruction}>
            1. A UX to identify accounts eligible for liquidation.
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.instruction}>
            2. A UX to liquidate accounts.
          </div>
        </div>
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
      case 'faq':
        return this.renderFAQ();
      default:
        return this.renderUnhealthyAccounts();
    }
  }
}
