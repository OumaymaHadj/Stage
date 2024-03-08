import inquirer from 'inquirer';
import fs from 'fs';
import fetchData from './fetchTables.js';


const redText = '\x1b[31m%s\x1b[0m';
const purpleText = '\x1b[35m%s\x1b[0m';

export function gatherDatabaseInfo(frameworksFilePath, databaseType) {
    console.log(purpleText,'To access your database, please enter the necessary parameters.');

    const questionsToAccessDB = [
        {
            type: 'input',
            name: 'sqliteFilePath',
            message: 'Enter the SQLite file path:',
            when: (answers) => answers.database === 'SQLite',
        },
        {
            type: 'input',
            name: 'databaseHost',
            message: 'Enter the database host:',
            when: (answers) => answers.database !== 'SQLite',
        },
        {
            type: 'input',
            name: 'databaseUsername',
            message: 'Enter the database username:',
            when: (answers) => answers.database !== 'SQLite',
        },
        {
            type: 'password',
            name: 'databasePassword',
            message: 'Enter the database password:',
            when: (answers) => answers.database !== 'SQLite',
        },
        {
            type: 'input',
            name: 'databaseName',
            message: 'Enter the database name:',
            when: (answers) => answers.database !== 'SQLite',
        },
    ];

    inquirer.prompt(questionsToAccessDB).then((database_info) => {
        const {
            sqliteFilePath,
            databaseHost,
            databaseUsername,
            databasePassword,
            databaseName,
        } = database_info;

        let existingData = {};
        try {
            const existingContent = fs.readFileSync(frameworksFilePath, 'utf-8');
            existingData = JSON.parse(existingContent);
        } catch (readError) {
            console.error(redText,`Error reading file: ${readError}`);
            return;
        }

        // Update the existing data with new information
        const newData = {
            ...existingData,
            database_info,
        };

        try {
            // Write the updated data back to the file
            fs.writeFileSync(frameworksFilePath, JSON.stringify(newData, null, 2));
            console.log(purpleText,`Data saved to ${frameworksFilePath}`);
        } catch (writeError) {
            console.error(redText,`Error writing to file: ${writeError}`);
        }

        //console.log('Database information saved to ' + frameworksFilePath, 'color: purple;');

        console.log(purpleText,`Database information saved to ${frameworksFilePath}`);

        const confirmQuestion =
        {
            type: 'confirm',
            name: 'confirm',
            message: 'Do you want to connect to the database?',
        }

        inquirer.prompt(confirmQuestion)
            .then((answers) => {
                if (answers.confirm) {
                    // Redirect to fetchTables.js (adjust the path accordingly)
                    fetchData();
                    console.log(purpleText,'Redirecting to fetchTables.js');
                } else {
                    // Exit the program
                    console.log(purpleText,'Exiting the program.');
                    process.exit(0);
                }
            })
            .catch((error) => {
                console.error(redText,'Error:', error);
            });
    });
}