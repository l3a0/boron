import React, { Component } from 'react';
import styles from './Bot.module.scss';
import BotDatabase from './BotDatabase';
import AccountsBot from './AccountsBot';

export default class BotControlPanel extends Component {
  async componentDidUpdate(prevProps) {
    if (this.props.tokenContracts) {
      let bots = await this.getBots();

      if (bots.length === 0) {
        console.log(`no bots found`);
        console.log(`initializing bots...`);
        this.initializeAccountsBot();
      } else {
        console.log(`found bots:`);
        console.log(bots);
        console.log(`waking bots...`);

        for (let i = 0; i < bots.length; i++) {
          const bot = this.createBot(bots[i], BotDatabase);
          await bot.wake();
          await bot.run();
          // await bot.sleep();
        }
      }
      // let accountsWithDebt = await this.getAccountsWithDebt();

      // Retrieve accounts with debt by querying Borrow events.
      // let tokens = this.getTokens();
    }
  }

  createBot(state, db) {
    switch (state.type) {
      case 'AccountsBot':
        return new AccountsBot(state, db);
    }
  }

  async initializeAccountsBot() {
    try {
      const bot = {
        name: 'Accounts Bot',
        type: 'AccountsBot',
      };

      await BotDatabase.bots.put(bot);
    } catch (error) {
      console.log(error);
    }
  }

  async getBots() {
    var bots = await BotDatabase.bots.toArray();

    return bots;
  }

  getTokens() {
  }

  async getAccountsWithDebt() {
    var cusdcContract = this.props.tokenContracts[0];

    console.log(`cusdcContract:`);
    console.log(cusdcContract);

    let options = {
      fromBlock: 0,
      toBlock: 'latest',
    };

    try {
      // let borrowEvents = await cusdcContract.getPastEvents('Borrow', options);

      // console.log(`borrowEvents:`);
      // console.log(borrowEvents);

      var result = await BotDatabase.bots.toArray();

      console.log(`result:`);
      console.log(result);
    }
    catch (error) {
      console.log(error);
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
