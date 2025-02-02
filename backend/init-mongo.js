db = db.getSiblingDB("DodoReads")

db.createUser({
  user: "root",
  pwd: "example",
  roles: [{ role: "readWrite", db: "DodoReads" }]
});

db.books.insertMany([
  {
    title: "Physics for Scientists and Engineers",
    ISBN: "9780321993724",
    authors: ["Raymond A. Serway", "John W. Jewett"],
    publisher: "Cengage Learning",
    publishedDate: "2018-01-01",
    language: "en",
    description: "A comprehensive introduction to physics, focusing on fundamental principles and their applications in engineering and science."
  },
]);

db.users.insertMany([
  {
    "email": "marco.rossi@example.com",
    "name": "Marco Rossi",
    "password": "$2b$10$HGmGKcva3pO.4yUsSmfuKeAHVqeE0Es.jTBVeLM9IgqHppCBIDDjq",
    "verified": true,
    "savedAuctions": [],
    "isAdmin": false,
    "createdAt": new Date("2025-01-07T18:25:20.771Z"),
    "updatedAt": new Date("2025-01-07T18:25:20.771Z"),
    "isBanned": false,
  },
  {
    "email": "giulia.bianchi@example.com",
    "name": "Giulia Bianchi",
    "password": "$2b$10$Un31JRM3JbsjCOMXyR1ZsemmtTwCfSKbAS4D9KxfQCtfiSInuEDb.",
    "verified": true,
    "savedAuctions": [],
    "isAdmin": false,
    "createdAt": new Date("2025-01-07T18:26:20.754Z"),
    "updatedAt": new Date("2025-01-07T18:26:20.754Z"),
    "isBanned": false,
  },
  {
    "email": "luca.ferrari@example.com",
    "name": "Luca Ferrari",
    "password": "$2b$10$VoZuNDJjU/NtfmvrQmiAke5OERho.Xna.fwgP18DpbAn0jtEOWIz6",
    "verified": true,
    "savedAuctions": [],
    "isAdmin": true,
    "createdAt": new Date("2025-01-07T18:28:35.988Z"),
    "updatedAt": new Date("2025-01-07T18:28:35.988Z"),
    "isBanned": false,
  },
]);