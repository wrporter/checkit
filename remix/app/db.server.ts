import { MongoClient } from 'mongodb';

function createMongoConnection(): Promise<MongoClient> {
    return new Promise<MongoClient>((resolve, reject) => {
        MongoClient.connect(
            'mongodb://localhost:27017/checkit',
            (error, client) => {
                if (error) {
                    console.error(
                        'Failed to connect to the Mongo database!',
                        error
                    );
                    reject(error);
                } else if (client) {
                    console.log(
                        'Successfully connected to the Mongo database!'
                    );
                    resolve(client);
                }
            }
        );
    });
}

let mongo: MongoClient;

declare global {
    var __db__: MongoClient;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// in production we'll have a single connection to the DB.
if (process.env.NODE_ENV === 'production') {
    createMongoConnection().then((client) => {
        mongo = client;
    });
} else {
    if (!global.__db__) {
        createMongoConnection().then((client) => {
            global.__db__ = client;
        });
    }
    mongo = global.__db__;
}

export { mongo };
