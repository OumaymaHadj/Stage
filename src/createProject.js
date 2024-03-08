import inquirer from 'inquirer';
import { exec } from 'child_process';
import path from 'path';
import { gatherDatabaseInfo } from './databaseInfo.js';
import fs from 'fs';


const redText = '\x1b[31m%s\x1b[0m';
const purpleText = '\x1b[35m%s\x1b[0m';


const frameworksFilePath = path.join(process.cwd(), 'frameworks.json');

const questionsToCreateProject = [
    {
        type: 'input',
        name: 'projectName',
        message: 'What is your project name?',
        validate: (input) => (input.trim() !== '' ? true : 'Please enter a valid project name'),
    },
    {
        type: 'list',
        name: 'technology',
        message: 'Which technology do you want to use?',
        choices: ['react', 'angular', 'vue'],
    },
    {
        type: 'list',
        name: 'database',
        message: 'Which database do you have?',
        choices: ['SQLite', 'MySQL', 'MongoDB', 'PostgreSQL', 'Microsoft SQL Server', 'Oracle Database'],
    },
];

inquirer.prompt(questionsToCreateProject).then((answers) => {
    const { projectName, technology, database } = answers;

    const data = {
        projectName, technology, database,
    }

    try {
        fs.writeFileSync(frameworksFilePath, JSON.stringify(data, null, 2));

        console.log(purpleText, `Answers saved to ${frameworksFilePath}`);
    } catch (error) {
        console.error(redText, `Error writing to file: ${error}`);
    }


    console.log(purpleText, `Creating ${technology} project ${projectName}...`);
    exec(`ng new ${projectName}`, (createError, createStdout, createStderr) => {
        if (createError) {
            console.error(redText, `Error creating project: ${createError}`);
            return;
        }

        console.log(createStdout);
        console.log(purpleText, `${technology} project ${projectName} created successfully.`);

        // Require and run the database information script
        
        gatherDatabaseInfo(frameworksFilePath, answers.database);
    });
});


