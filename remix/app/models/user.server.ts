import bcrypt from 'bcryptjs';

import { mongo } from '~/db.server';
import { ObjectId } from 'mongodb';

export interface MongoUser {
    _id: ObjectId;
    imageUrl?: string;
    image?: string;
    displayName: string;
    email: string;
    password?: string;
    socialProviders?: { [key: string]: boolean };
    createdAt: Date;
    updatedAt: Date;
}

export interface User {
    id: string;
    imageUrl?: string;
    image?: string;
    displayName: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

function toUserWithoutPassword(mongoUser: MongoUser | null): User | null {
    if (!mongoUser) {
        return null;
    }
    const { _id, imageUrl, image, displayName, email, createdAt, updatedAt } =
        mongoUser;
    return {
        id: _id.toHexString(),
        imageUrl,
        image,
        displayName,
        email,
        createdAt,
        updatedAt,
    };
}

export async function getUserById(id: string): Promise<User | null> {
    const user = await (
        await mongo
    )
        .db()
        .collection('users')
        .findOne<MongoUser>({ _id: ObjectId.createFromHexString(id) });

    return toUserWithoutPassword(user);
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const user = await mongo
        .db()
        .collection('users')
        .findOne<MongoUser>({ email });

    return toUserWithoutPassword(user);
}

export async function createUser(
    displayName: string,
    email: string,
    password?: string,
    imageUrl?: string,
    image?: string,
    socialProviders?: { [key: string]: boolean }
): Promise<User> {
    const user: MongoUser = {
        _id: new ObjectId(),
        imageUrl,
        image,
        displayName,
        email,
        socialProviders,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    if (password) {
        user.password = await bcrypt.hash(password, 10);
    }

    await mongo.db().collection<MongoUser>('users').insertOne(user);

    return toUserWithoutPassword(user) as User;
}

export async function deleteUserByEmail(email: string) {
    return mongo.db().collection('users').deleteOne({ email });
}

export async function verifyLogin(
    email: string,
    password: string
): Promise<User | null> {
    const userWithPassword = await mongo
        .db()
        .collection('users')
        .findOne<MongoUser>({ email });
    // console.log(userWithPassword);

    if (!userWithPassword?.password) {
        return null;
    }

    const isValid = await bcrypt.compare(password, userWithPassword.password);

    if (!isValid) {
        return null;
    }

    return toUserWithoutPassword(userWithPassword);
}
