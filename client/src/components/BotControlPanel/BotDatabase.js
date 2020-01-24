import Dexie from 'dexie';

const BotDatabase = new Dexie('BotDatabase');

BotDatabase.version(1).stores({
    accounts: `&address`,
    tokens: `&address`,
    bots: `&name`
});

export default BotDatabase;