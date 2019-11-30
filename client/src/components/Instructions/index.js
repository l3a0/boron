import React, { Component } from 'react';
import { Table } from 'rimble-ui';
import styles from './Instructions.module.scss';

export default class Instructions extends Component {

  renderSetup() {
    var results = fetch("https://api.compound.finance/api/v2/account") // Call the fetch function passing the url of the API as a parameter
    .then((response) => response.json())
    .then(function(data) {
      // Your code for handling the data you get from the API
    })
    .catch(function(error) {
      // This is where you run code if the server returns any errors
    });

    return (
      <div className={styles.instructions}>
        <h1> Browse Underwater Accounts </h1>
        <Table>
          <thead>
            <tr>
              <th>Transaction hash</th>
              <th>Value</th>
              <th>Recipient</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>0xeb...cc0</td>
              <td>0.10 ETH</td>
              <td>0x4fe...581</td>
              <td>March 28 2019 08:47:17 AM +UTC</td>
            </tr>
            <tr>
              <td>0xsb...230</td>
              <td>0.11 ETH</td>
              <td>0x4gj...1e1</td>
              <td>March 28 2019 08:52:17 AM +UTC</td>
            </tr>
            <tr>
              <td>0xed...c40</td>
              <td>0.12 ETH</td>
              <td>0x3fd...781</td>
              <td>March 28 2019 08:55:17 AM +UTC</td>
            </tr>
          </tbody>
        </Table>
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
      case 'setup':
        return this.renderSetup();
      case 'faq':
        return this.renderFAQ();
      default:
        return this.renderSetup();
    }
  }
}
