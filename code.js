const readline = require("readline");
const fs = require("fs");
const sqlite3 = require("sqlite3");
const path = require("path");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function generateRandomNamesAndSurnames(
  firstNameArray,
  lastNameArray,
  numRecords
) {
  const records = [];
  const usedFullNames = new Set();

  function formatDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  while (records.length < numRecords) {
    const randomFirstName =
      firstNameArray[Math.floor(Math.random() * firstNameArray.length)];
    const randomLastName =
      lastNameArray[Math.floor(Math.random() * lastNameArray.length)];
    const fullName = `${randomFirstName} ${randomLastName}`;
    const initials = `${randomFirstName.charAt(0)}`;
    const age = Math.floor(Math.random() * (80 - 5 + 1)) + 5;
    const birthYear = 2024 - age;
    const birthDate = new Date(
      birthYear,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    );

    if (!usedFullNames.has(fullName)) {
      records.push({
        Name: randomFirstName,
        Surname: randomLastName,
        Initials: initials,
        Age: age,
        DateOfBirth: formatDate(birthDate),
      });
      usedFullNames.add(fullName);
    }
  }
  return records;
}

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

rl.question(
  "Enter the number of records to generate: ",
  (numRecordsToGenerate) => {
    numRecordsToGenerate = parseInt(numRecordsToGenerate);

    if (isNaN(numRecordsToGenerate) || numRecordsToGenerate <= 0) {
      console.log("Invalid input. Please enter a positive integer.");
      rl.close();
      return;
    }

    const generatedRecords = generateRandomNamesAndSurnames(
      firstNames,
      lastNames,
      numRecordsToGenerate
    );

    console.log(generatedRecords);

    const outputFolderPath = "./output";

    if (!fs.existsSync(outputFolderPath)) {
      fs.mkdirSync(outputFolderPath);
    }

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

    const db = new sqlite3.Database("Mydatabase.db", (err) => {
      if (err) {
        console.error("Error opening database:", err.message);
      } else {
        console.log("Database opened successfully.");
      }
    });

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

        db.run("DELETE FROM csv_import", function (err) {
          if (err) {
            console.error("Error deleting records:", err.message);
          } else {
            console.log("Existing records deleted successfully.");
          }

          generatedRecords.forEach((record) => {
            db.run(
              `INSERT INTO csv_import (Name, Surname, Initials, Age, DateOfBirth) VALUES (?, ?, ?, ?, ?)`,
              [
                record.Name,
                record.Surname,
                record.Initials,
                record.Age,
                record.DateOfBirth,
              ],
              function (err) {
                if (err) {
                  console.error("Error inserting record:", err.message);
                } else {
                  console.log(
                    `A new record has been inserted with Id: ${this.lastID}`
                  );
                }
              }
            );
          });

          db.close((err) => {
            if (err) {
              console.error("Error closing database:", err.message);
            } else {
              console.log("Database closed successfully.");
            }
          });
        });
        rl.close();
      }
    );
  }
);
