class Bot {
    constructor(state, db) {
        this.db = db;
        this.state = state;
    }

    async wake() {
        console.log(`${this.state.name} waking...`);
        this.state.lastWakeTime = new Date(Date.now());
        console.log(this.state);
    }

    async run() {
        console.log(`${this.state.name} running...`);
    }

    async sleep() {
        console.log(`${this.state.name} sleeping...`);
        this.state.lastSleepTime = new Date(Date.now());
        console.log(this.state);
        console.log(`${this.state.name} saving state`);
        await this.db.bots.put(this.state);
        console.log(`${this.state.name} saved state`);
    }
}

export default Bot;