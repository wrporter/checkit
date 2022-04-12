import { ObjectId } from 'mongodb';
import { mongo } from '~/db.server';

export interface Item {
    id: string;
    userId: string;
    text: string;
    dateCreated: Date;
    dateCompleted?: Date;
}
interface MongoItem {
    _id: ObjectId;
    userId: ObjectId;
    text: string;
    dateCreated: Date;
    dateCompleted?: Date;
}

export async function createItem(userId: string, text: string): Promise<Item> {
    const item: MongoItem = {
        _id: new ObjectId(),
        userId: ObjectId.createFromHexString(userId),
        text,
        dateCreated: new Date(),
    };

    await mongo.db().collection<MongoItem>('items').insertOne(item);

    return {
        id: item._id.toHexString(),
        userId,
        text,
        dateCreated: item.dateCreated,
    };
}

export async function getItemsForUser(userId: string): Promise<Item[]> {
    const items = await mongo
        .db()
        .collection<MongoItem>('items')
        .find(
            { userId: ObjectId.createFromHexString(userId) },
            { sort: { dateCreated: -1 } }
        )
        .toArray();

    return items.map((item) => ({
        id: item._id.toHexString(),
        userId,
        text: item.text,
        dateCreated: item.dateCreated,
        dateCompleted: item.dateCompleted,
    }));
}

export async function deleteItemsForUser(userId: string): Promise<void> {
    await mongo
        .db()
        .collection('items')
        .deleteMany({ userId: ObjectId.createFromHexString(userId) });
}

export async function deleteCompletedItemsForUser(
    userId: string
): Promise<void> {
    await mongo
        .db()
        .collection('items')
        .deleteMany({
            userId: ObjectId.createFromHexString(userId),
            dateCompleted: { $ne: null },
        });
}

export async function updateItemStatus(
    userId: string,
    itemId: string,
    status: 'complete' | 'incomplete'
): Promise<void> {
    await mongo
        .db()
        .collection('items')
        .updateOne(
            {
                _id: ObjectId.createFromHexString(itemId),
                userId: ObjectId.createFromHexString(userId),
            },
            {
                $set: {
                    dateCompleted: status === 'complete' ? new Date() : null,
                },
            }
        );
}
