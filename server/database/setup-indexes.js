db.users.createIndex(
    { email: 1 }
);

db.items.createIndex(
    { _id: 1, userId: 1 }
);
db.items.createIndex(
    { userId: 1, dateCreated: -1 }
);
