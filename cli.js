#!/usr/bin/env node

const prompts = require("prompts");
const kleur = require("kleur");
const fs = require("fs");
const { parse: syncParse } = require("csv-parse/sync");
const { parse } = require("csv-parse");
const { stringify } = require("csv-stringify");
const advancedFormat = require("dayjs/plugin/advancedFormat");
const dayjs = require("dayjs");
dayjs.extend(advancedFormat);
const shortid = require("shortid");

const rootPath = "./";
packageName = "CSV Row Multiplier";
const filesInRootPath = fs.readdirSync(rootPath);
const csvFilesInRootPath = filesInRootPath.filter((str) =>
  str.includes(".csv")
);
let fileToBeModified = "";
let finalFileName = "";
const initialQuestions = [
  {
    type: "select",
    name: "fileToBeModified",
    message:
      "Select the file which you need to process from the current directory",
    choices: csvFilesInRootPath,
  },
  {
    type: "date",
    name: "fileDated",
    mask: "YYYY-MM-DD",
    message:
      "What is the list date? (Date to be associated with the file name for archival purposes)",
  },
  {
    type: "number",
    name: "chunkSize",
    initial: 2000,
    message: "How many entries should each of the exported file have?",
    validate: (chunkSize) =>
      chunkSize > 10 ? true : "Must be a number and not less than 10",
  },
  {
    type: "text",
    name: "multiplyingColumn",
    message: "What do you want to name the multiplying column as?",
    initial: "Phone No.",
  },
];
// Misc Functions
const logWelcomeMessage = () =>
  console.log(
    kleur
      .red()
      .bgWhite()
      .bold()
      .underline(`Welcome to ${packageName} - A tool built by Rapidsols!`)
  );
const logExitMessage = () =>
  console.log(
    kleur
      .white()
      .bgRed()
      .bold()
      .underline(
        `Quitting ${packageName}! Thank you for using ${packageName} by Rapidsols`
      )
  );
const logNoCSVFound = () =>
  console.log(
    kleur
      .bgRed()
      .white()
      .italic(
        "The folder that you're running this tool in does not contain any CSV files, please run this tool where the CSV file to be modified is located."
      )
  );
const logFileCreatedMessage = (fileName) => {
  console.log(
    kleur
      .white()
      .bgYellow()
      .bold()
      .underline(
        `File (${fileName}) generated and saved in the current directory`
      )
  );
};
const logFinalMessage = () => {
  console.log(
    kleur
      .white()
      .bgGreen()
      .bold()
      .underline(`Thank you for using ${packageName}`)
  );
};
const onPromptCancel = (prompt) => {
  logExitMessage();
  process.exit();
};
const sliceIntoChunks = (arr, chunkSize) => {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
};

// Check if current folder has any csv files
if (csvFilesInRootPath.length <= 0) {
  logWelcomeMessage();
  logNoCSVFound();
  process.exit();
}

(async () => {
  logWelcomeMessage();
  const initialResponse = await prompts(initialQuestions, {
    onCancel: onPromptCancel,
  });
  fileToBeModified = csvFilesInRootPath[initialResponse?.fileToBeModified];
  finalFileName = `${shortid.generate().toUpperCase()}-${dayjs(
    initialResponse?.fileDated
  ).format("DoMMMMYYYY")}`;
  const readCSV = fs.readFileSync(fileToBeModified);
  const headerColumns = syncParse(readCSV, { to_line: 1 })[0];

  const secondaryResponse = await prompts(
    {
      type: "multiselect",
      name: "columns",
      message:
        "Select which columns need to be preserved except the multiplying columns?",
      choices: headerColumns,
    },
    {
      onCancel: onPromptCancel,
    }
  );

  const tertiaryResponse = await prompts(
    {
      type: "multiselect",
      name: "columns",
      message: "Select multiplying columns only?",
      choices: headerColumns,
    },
    {
      onCancel: onPromptCancel,
    }
  );

  const multiplyingColumns = tertiaryResponse?.columns;
  const miscColumns = secondaryResponse?.columns;
  const miscColumnsNames = Array.from(miscColumns, (val) => headerColumns[val]);

  const records = [];
  const parser = fs.createReadStream(fileToBeModified).pipe(
    parse({
      from: 2,
    })
  );
  records.push([
    ...miscColumnsNames,
    initialResponse?.multiplyingColumn || "Multiplying Column",
  ]);

  for await (const record of parser) {
    const miscDetails = [];
    const multiplyingColumn = [];

    for (let index = 0; index < miscColumns.length; index++) {
      miscDetails.push(record[miscColumns[index]]);
    }

    for (let index = 0; index < multiplyingColumns.length; index++) {
      const multiplyingCol = record[multiplyingColumns[index]];
      if (multiplyingCol) {
        multiplyingColumn.push(multiplyingCol);
      }
    }

    for (let index = 0; index < multiplyingColumn.length; index++) {
      records.push([...miscDetails, multiplyingColumn[index]]);
    }
  }

  const recordsArray = sliceIntoChunks(records, initialResponse.chunkSize);

  for (let index = 0; index < recordsArray.length; index++) {
    const fileIndex = index + 1;
    const indexedFileName = `${finalFileName}-${fileIndex}.csv`;
    stringify(recordsArray[index], { delimiter: "," }, (err, output) => {
      if (err) throw err;
      fs.writeFile(`${indexedFileName}`, output, (err) => {
        if (err) throw err;
        logFileCreatedMessage(indexedFileName);
      });
    });
  }

  logFinalMessage();
})();
