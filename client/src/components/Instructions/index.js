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

  componentDidMount = async () => {
    const { name } = this.props;
    switch (name) {
      case 'unhealthyAccounts':
        await this.loadUnhealthyAccounts();
      case 'liquidations':
        await this.loadLiquidations();
      default:
        return this.loadUnhealthyAccounts();
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
        this.setState({ liquidations: liquidations });
      }
      catch (error) {
        console.log(error);
      }
    }
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
          <h1> Browse Compound USDC Liquidations </h1>
          <Table width="2">
            <thead>
              <tr>
                <th>Liquidator</th>
                <th>Borrower</th>
                <th>Repay Amount (cUSDC)</th>
                <th>Revenue (cToken)</th>
                <th>Collateral cToken Address</th>
              </tr>
            </thead>
            <tbody>
              {this.state.liquidations.map((value, index) => {
                return (
                  <tr>
                    <td>{value.returnValues['liquidator']}</td>
                    <td>{value.returnValues['borrower']}</td>
                    <td><NumberFormat value={value.returnValues['repayAmount']} displayType={'text'} thousandSeparator={true} /></td>
                    <td><NumberFormat value={value.returnValues['seizeTokens']} displayType={'text'} thousandSeparator={true} /></td>
                    <td>{value.returnValues['cTokenCollateral']}</td>
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
        <h1> Browse Compound USDC Liquidations </h1>
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
