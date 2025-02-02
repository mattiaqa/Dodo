db = db.getSiblingDB("DodoReads"); // Seleziona o crea il database

db.createUser({
    user: "root",
    pwd: "example",
    roles: [{ role: "readWrite", db: "DodoReads" }]
});

db.users.insertMany([
    {
        "email": "antonio.deluca@example.com",
        "name": "Antonio De Luca",
        "password": "$2b$10$sGW8v/e6asBTbzf5A5mCKuNwae4ZnbPRzBuiGleOPFapXcurYJPNy",
        "verified": true,
        "savedAuctions": [],
        "isAdmin": false,
        "createdAt": new Date("2025-01-07T18:31:48.441Z"),
        "updatedAt": new Date("2025-01-07T18:31:48.441Z")
    },
    {
        "email": "elena.greco@example.com",
        "name": "Elena Greco",
        "password": "$2b$10$BC0WW0cGBfcMJxdu9.FMwuD.6z2YmKHzn3meGbUNRMb5eIq9mq8h6",
        "verified": true,
        "savedAuctions": [],
        "isAdmin": true,
        "createdAt": new Date("2025-01-07T18:32:17.687Z"),
        "updatedAt": new Date("2025-01-07T18:32:17.687Z")
    }
]);