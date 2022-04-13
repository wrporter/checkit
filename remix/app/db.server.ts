import { MongoClient } from 'mongodb';

declare global {
    var __db__: MongoClient;
}

function mongo(): Promise<MongoClient> {
    if (global.__db__) {
        return Promise.resolve(global.__db__);
    }

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
                    global.__db__ = client;
                    resolve(client);
                }
            }
        );
    });
}

export { mongo };
