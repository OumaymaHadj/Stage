import inquirer from 'inquirer';
import { exec, execSync } from 'child_process';
import { configMyDb } from './myDB.js';
import mysql from 'mysql';
import fs from 'fs-extra';
import path from 'path';
import help from './help.js';
import { projectName } from './databaseInfo.js';

const redText = '\x1b[31m%s\x1b[0m';
const purpleText = '\x1b[35m%s\x1b[0m';
const greenText = '\x1b[32m%s\x1b[0m';


function establishConnection(config) {
  return mysql.createConnection(config);
}

async function performQuery(connection, sql, values) {
  return new Promise((resolve, reject) => {
    connection.query(sql, values, (error, results, fields) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}
export default function initializeProject() {

  const questionsToCreateProject = [
    {
      type: 'input',
      name: 'projectName',
      message: 'What is your project name?',
      validate: (input) => (input.trim() !== '' ? true : 'Please enter a valid project name'),
    },
    {
      type: 'list',
      name: 'technologyFront',
      message: 'Which front-end technology do you want to use?',
      choices: ['React.js', 'Vue.js', 'Angular'],
    },
    {
      type: 'list',
      name: 'frameworkBack',
      message: 'Which back-end technology do you want to use?',
      choices: ['Express.js (Node.js)', 'Django (Python)', 'Spring Boot (Java)', 'Laravel (PHP)'],
    },
    {
      type: 'list',
      name: 'database',
      message: 'Which database do you have?',
      choices: ['SQLite', 'MySQL', 'MongoDB', 'PostgreSQL', 'Microsoft SQL Server', 'Oracle Database'],
    },
  ];

  inquirer.prompt(questionsToCreateProject).then(async (answers) => {
    const { projectName, technologyFront, frameworkBack, database } = answers;


    const connection = establishConnection(configMyDb);

    try {
      await performQuery(connection, 'INSERT INTO project (name, frontend_technology, backend_technology, database_type) VALUES (?, ?, ?, ?)', [projectName, technologyFront, frameworkBack, database]);
      console.log(greenText, 'New project successfully added in database framework \u2714');
    } catch (error) {
      console.error('Error executing SQL query:', error);
    } finally {
      connection.end();
    }

    const loadingInterval = showLoading();
    exec(`ng new ${projectName}`, (createError) => {

      clearInterval(loadingInterval);
      if (createError) {
        console.error(`Error creating ${technologyFront} project: ${createError}`);
        return;
      }
      console.log(purpleText, `DONE \u2714.`);
      console.log(greenText, `\x1b[1m${technologyFront} project ${projectName} created.`);

      // update the styles.css file to css file of the new project && add images folder

      updateStyles(projectName);

    });
  });
}

export function showLoading() {
  const loader = ['|', '/', '-', '\\'];
  let i = 0;
  return setInterval(() => {
    process.stdout.write(`\r${loader[i]} Creating project...`);
    i = (i + 1) % loader.length;
  }, 200);
}


async function addImagesToProject(projectName) {

  const sourceDir = path.join(process.cwd(), 'public/images');
  const destDir = path.join(process.cwd(), projectName, 'src/images');

  try {
    const sourceExists = await fs.pathExists(sourceDir);
    if (!sourceExists) {
      console.error('Source directory does not exist.');
      return;
    }
    await fs.ensureDir(destDir);
    await fs.copy(sourceDir, destDir);
    console.log('Images copied successfully. \u2714');
    help();
  } catch (err) {
    console.error(redText, 'Error copying images:', err);
  }
}

function updateStyles(projectName) {

  const destCssFilePath = path.join(process.cwd(), projectName, 'src/styles.css');
  const srcCssFilePath = path.join(process.cwd(), 'public/styles.css');

  fs.readFile(srcCssFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading CSS file: ${err}`);
      return;
    }

    fs.writeFile(destCssFilePath, data, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing CSS file to project: ${err}`);
        return;
      }

      console.log('CSS file updated successfully. \u2714');

      // copy folder images 
      addImagesToProject(projectName);
    });
  });

}
