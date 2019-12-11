import React, { Component } from 'react';
import styles from './Bot.module.scss';
import getWeb3 from '../../utils/getWeb3';

export default class Bot extends Component {
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
      console.log(data);
      this.setState({ accountResponse: data });
    }
    catch (e) {
      // This is where you run code if the server returns any errors
      console.log(e);
    }
  }

  renderBot() {
    return (
      <div className={styles.instructions}>
        <h1> Manage Bot </h1>
      </div>
    );
  }

  render() {
    return this.renderBot();
  }
}
