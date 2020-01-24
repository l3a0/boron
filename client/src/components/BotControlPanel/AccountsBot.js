import Bot from './Bot';
import * as Comlink from "comlink";

class AccountsBot extends Bot {
    constructor(state, db) {
        super(state, db);
    }

    async wake() {
        super.wake();
        console.log(`${this.state.name} is creating worker...`);
        const AccountsBotWorker = Comlink.wrap(new Worker('./AccountsBot.worker.js', { type: 'module' }));
        this.worker = await new AccountsBotWorker();
        console.log(`Created worker:`);
        console.log(this.worker);
    }

    async run() {
        super.run();
        await this.worker.run(this.state);
    }
}

export default AccountsBot;