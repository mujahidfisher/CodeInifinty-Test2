// node packages import
const readline = require("readline");
const fs = require("fs");
const sqlite3 = require("sqlite3");
const path = require("path");

//  interface for reading input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function generateRandomNamesAndSurnames(
  // params
  firstNameArray,
  lastNameArray,
  numRecords
) {
  // empty array
  const records = [];

  // function too format date dd/mm/yyyy
  function formatDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  // this is the random generator loop
  while (records.length < numRecords) {
    const randomFirstName =
      firstNameArray[Math.floor(Math.random() * firstNameArray.length)];
    const randomLastName =
      lastNameArray[Math.floor(Math.random() * lastNameArray.length)];
    const initials = `${randomFirstName.charAt(0)}`;
    const age = Math.floor(Math.random() * (80 - 5 + 1)) + 5;
    const birthYear = 2024 - age;
    const birthDate = new Date(
      birthYear,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    );

    // pushes all the data to the records array
    records.push({
      Name: randomFirstName,
      Surname: randomLastName,
      Initials: initials,
      Age: age,
      DateOfBirth: formatDate(birthDate),
    });
  }
  return records;
}

// this is the array of names
const firstNames = [
  "Mujahid",
  "Alonso",
  "Amy",
  "Benjamin",
  "Curtis",
  "Daniel",
  "John",
  "Emma",
  "Michael",
  "Sophia",
  "William",
  "Olivia",
  "James",
  "Isabella",
  "Alexander",
  "Mia",
  "Joseph",
  "Abigail",
  "Samuel",
  "Harper",
];

// this is the array of surnames
const lastNames = [
  "Fisher",
  "Cupido",
  "Peterse",
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Miller",
  "Davis",
  "Garcia",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
];

// prompt to enter the number of records wanted too generate
rl.question(
  "Enter the number of records to generate: ",
  (numRecordsToGenerate) => {
    numRecordsToGenerate = parseInt(numRecordsToGenerate);

    if (isNaN(numRecordsToGenerate) || numRecordsToGenerate <= 0) {
      console.log("Invalid input. Please enter a positive integer.");
      rl.close();
      return;
    }

    // TEST
    const generatedRecords = generateRandomNamesAndSurnames(
      firstNames,
      lastNames,
      numRecordsToGenerate
    );

    console.log(generatedRecords);

    const outputFolderPath = "./output"; // path
    // creates an output folder (if not existing)
    if (!fs.existsSync(outputFolderPath)) {
      fs.mkdirSync(outputFolderPath);
    }

    // generates a CSV file and inserts the content into it
    const csvContent = generatedRecords
      .map((record) => Object.values(record).join(","))
      .join("\n");

    const outputPath = path.join(outputFolderPath, "output.csv");

    fs.writeFile(outputPath, csvContent, (err) => {
      if (err) {
        console.error("Error writing CSV file:", err);
      } else {
        console.log("CSV file created successfully at:", outputPath);
      }
    });

    // connection to an SQLite3 database
    const db = new sqlite3.Database("Mydatabase.db", (err) => {
      if (err) {
        console.error("Error opening database:", err.message);
      } else {
        console.log("Database opened successfully.");
      }
    });

    // table creation (if not existing)
    db.run(
      `CREATE TABLE IF NOT EXISTS csv_import (
    id INTEGER PRIMARY KEY,
    Name TEXT,
    Surname TEXT,
    Initials TEXT,
    Age INTEGER,
    DateOfBirth TEXT
  )`,
      function (err) {
        if (err) {
          console.error("Error creating table:", err.message);
        } else {
          console.log("Table created successfully.");
        }
        // delete query so that new data is added and old data is removed
        db.run("DELETE FROM csv_import", function (err) {
          if (err) {
            console.error("Error deleting records:", err.message);
          } else {
            console.log("Existing records deleted successfully.");
          }

          // batch insertion into a database
          const batchSize = 100;
          for (let i = 0; i < generatedRecords.length; i += batchSize) {
            const batch = generatedRecords.slice(i, i + batchSize);
            const placeholders = batch.map(() => "(?, ?, ?, ?, ?)").join(", ");
            const values = batch.flatMap((record) => [
              record.Name,
              record.Surname,
              record.Initials,
              record.Age,
              record.DateOfBirth,
            ]);

            // data is inserted into the database
            db.run(
              `INSERT INTO csv_import (Name, Surname, Initials, Age, DateOfBirth) VALUES ${placeholders}`,
              values,
              function (err) {
                if (err) {
                  console.error("Error bulk inserting records:", err.message);
                } else {
                  console.log(`${this.changes} records inserted successfully.`);
                }
              }
            );
          }
          // closing the database
          db.close((err) => {
            if (err) {
              console.error("Error closing database:", err.message);
            } else {
              console.log("Database closed successfully.");
            }
          });

          rl.close();
        });
      }
    );
  }
);
