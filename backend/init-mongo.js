db = db.getSiblingDB("DodoReads"); // Seleziona o crea il database

db.createUser({
  user: "root",
  pwd: "example",
  roles: [{ role: "readWrite", db: "DodoReads" }]
});

// Popola la collezione "books" con i dati
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
  {
    title: "Organic Chemistry",
    ISBN: "9780321971371",
    authors: ["L. G. Wade Jr."],
    publisher: "Pearson",
    publishedDate: "2016-01-08",
    language: "en",
    description: "An in-depth exploration of organic chemistry principles, reactions, and mechanisms."
  },
  {
    title: "Calculus: Early Transcendentals",
    ISBN: "9781319050740",
    authors: ["James Stewart"],
    publisher: "Cengage Learning",
    publishedDate: "2015-12-01",
    language: "en",
    description: "A widely used textbook for calculus, covering limits, derivatives, integrals, and advanced topics in a rigorous yet accessible way."
  },
  {
    title: "Molecular Biology of the Cell",
    ISBN: "9780815344322",
    authors: ["Bruce Alberts", "Alexander Johnson", "Julian Lewis", "Martin Raff", "Keith Roberts", "Peter Walter"],
    publisher: "Garland Science",
    publishedDate: "2014-11-18",
    language: "en",
    description: "A foundational text for cell biology, explaining molecular mechanisms and cellular functions in depth."
  },
  {
    title: "Introduction to Electrodynamics",
    ISBN: "9781108420419",
    authors: ["David J. Griffiths"],
    publisher: "Cambridge University Press",
    publishedDate: "2017-06-30",
    language: "en",
    description: "A clear and thorough introduction to the principles of electrodynamics, widely used in undergraduate physics courses."
  },
  {
    title: "Modern Physics",
    ISBN: "9781133103721",
    authors: ["Kenneth S. Krane"],
    publisher: "Cengage Learning",
    publishedDate: "2012-01-01",
    language: "en",
    description: "A detailed look at modern physics topics, including relativity, quantum mechanics, and particle physics."
  },
  {
    title: "Principles of Biochemistry",
    ISBN: "9781319108243",
    authors: ["David L. Nelson", "Michael M. Cox"],
    publisher: "W. H. Freeman",
    publishedDate: "2017-04-24",
    language: "en",
    description: "An essential text for understanding the chemistry of life at a molecular level."
  },
  {
    title: "Introduction to Algorithms",
    ISBN: "9780262033848",
    authors: ["Thomas H. Cormen", "Charles E. Leiserson", "Ronald L. Rivest", "Clifford Stein"],
    publisher: "MIT Press",
    publishedDate: "2009-07-31",
    language: "en",
    description: "A comprehensive guide to algorithms, widely used in computer science and engineering courses."
  },
  {
    title: "Fundamentals of Thermodynamics",
    ISBN: "9781118321775",
    authors: ["Richard E. Sonntag", "Claus Borgnakke"],
    publisher: "Wiley",
    publishedDate: "2015-01-07",
    language: "en",
    description: "A foundational text for understanding the laws of thermodynamics and their applications in engineering."
  },
  {
    title: "The Feynman Lectures on Physics",
    ISBN: "9780465023820",
    authors: ["Richard P. Feynman", "Robert B. Leighton", "Matthew Sands"],
    publisher: "Basic Books",
    publishedDate: "2011-10-04",
    language: "en",
    description: "A classic collection of physics lectures by Richard Feynman, covering a wide range of topics in an engaging and insightful way."
  }
]);

// Popolamento della collezione users con i dati (inclusi password già hashate)
db.users.insertMany([
  {
    "email": "4c4rder@gmail.com",
    "name": "Admin Admin",
    "password": "$2b$10$LsIJhoHqkXrwCFqXSpLGEO.uvDASA7DWpp8i0Btnx.sxqOBksYym.",
    "verified": true,
    "savedAuctions": [],
    "isAdmin": true,
    "createdAt": new Date("2025-01-07T18:08:53.397Z"),
    "updatedAt": new Date("2025-01-07T18:08:53.397Z")
  },
  {
    "email": "marco.rossi@example.com",
    "name": "Marco Rossi",
    "password": "$2b$10$HGmGKcva3pO.4yUsSmfuKeAHVqeE0Es.jTBVeLM9IgqHppCBIDDjq",
    "verified": true,
    "savedAuctions": [],
    "isAdmin": false,
    "createdAt": new Date("2025-01-07T18:25:20.771Z"),
    "updatedAt": new Date("2025-01-07T18:25:20.771Z")
  },
  {
    "email": "giulia.bianchi@example.com",
    "name": "Giulia Bianchi",
    "password": "$2b$10$Un31JRM3JbsjCOMXyR1ZsemmtTwCfSKbAS4D9KxfQCtfiSInuEDb.",
    "verified": true,
    "savedAuctions": [],
    "isAdmin": false,
    "createdAt": new Date("2025-01-07T18:26:20.754Z"),
    "updatedAt": new Date("2025-01-07T18:26:20.754Z")
  },
  {
    "email": "luca.ferrari@example.com",
    "name": "Luca Ferrari",
    "password": "$2b$10$VoZuNDJjU/NtfmvrQmiAke5OERho.Xna.fwgP18DpbAn0jtEOWIz6",
    "verified": true,
    "savedAuctions": [],
    "isAdmin": false,
    "createdAt": new Date("2025-01-07T18:28:35.988Z"),
    "updatedAt": new Date("2025-01-07T18:28:35.988Z")
  },
  {
    "email": "francesca.esposito@example.com",
    "name": "Francesca Esposito",
    "password": "$2b$10$D8sBQUKFd5xsmJfeX1i5eeIixUnmzGkUX9VK81x13Q1VtK6PDJvwi",
    "verified": true,
    "savedAuctions": [],
    "isAdmin": false,
    "createdAt": new Date("2025-01-07T18:29:07.169Z"),
    "updatedAt": new Date("2025-01-07T18:29:07.169Z")
  },
  {
    "email": "andrea.romano@example.com",
    "name": "Andrea Romano",
    "password": "$2b$10$pbbaIEDhJoW9yVF0/4nZheGJB2g2ltzql19SOzlzPODvdKwLJZ8bW",
    "verified": true,
    "savedAuctions": [],
    "isAdmin": false,
    "createdAt": new Date("2025-01-07T18:29:42.224Z"),
    "updatedAt": new Date("2025-01-07T18:29:42.224Z")
  },
  {
    "email": "laura.colombo@example.com",
    "name": "Laura Colombo",
    "password": "$2b$10$5rMQ.E0jf6J9YXwQfgyV6uFw2ZeuHO6hsw84d0LNv4DIILf9X6QHO",
    "verified": true,
    "savedAuctions": [],
    "isAdmin": false,
    "createdAt": new Date("2025-01-07T18:30:16.892Z"),
    "updatedAt": new Date("2025-01-07T18:30:16.892Z")
  },
  {
    "email": "giuseppe.ricci@example.com",
    "name": "Giuseppe Ricci",
    "password": "$2b$10$dVAVFmMOieyfniZrhKFYPujI9ECyK9Jh30wrnhftKRxwnRAjAe.W.",
    "verified": true,
    "savedAuctions": [],
    "isAdmin": false,
    "createdAt": new Date("2025-01-07T18:30:46.854Z"),
    "updatedAt": new Date("2025-01-07T18:30:46.854Z")
  },
  {
    "email": "sofia.moretti@example.com",
    "name": "Sofia Moretti",
    "password": "$2b$10$rkmVDQOO889fMkCeCtd9M.zkF/6FC9T3On6lccx9VDyp8DWqF9hcC",
    "verified": true,
    "savedAuctions": [],
    "isAdmin": false,
    "createdAt": new Date("2025-01-07T18:31:10.461Z"),
    "updatedAt": new Date("2025-01-07T18:31:10.461Z")
  },
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
    "isAdmin": false,
    "createdAt": new Date("2025-01-07T18:32:17.687Z"),
    "updatedAt": new Date("2025-01-07T18:32:17.687Z")
  }
]);