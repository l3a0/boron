import * as Comlink from "comlink";

class AccountsBotWorker
{
    run(state) {
        console.log(`AccountsBotWorker is running with state...`);
        console.log(state);
        setTimeout(() => this.run(state), 5000);
    }
}

Comlink.expose(AccountsBotWorker);