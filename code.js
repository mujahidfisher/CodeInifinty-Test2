const fs = require("fs");
// const sqlite3 = require("sqlite3");

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
    const initials = `${randomFirstName.charAt(0)}${randomLastName.charAt(0)}`;
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

const numRecordsToGenerate = 20;

const generatedRecords = generateRandomNamesAndSurnames(
  firstNames,
  lastNames,
  numRecordsToGenerate
);

console.log(generatedRecords);

const csvContent = generatedRecords
  .map((record) => Object.values(record).join(","))
  .join("\n");

fs.writeFile("output.csv", csvContent, (err) => {
  if (err) {
    console.error("Error writing CSV file:", err);
  } else {
    console.log("CSV file created successfully!");
  }
});