import inquirer from 'inquirer';
import { configMyDb } from './myDB.js';
import util from 'util';
import mysql from 'mysql';
import readline from 'readline';
import help from './help.js';
import path from 'path';
import fs from 'fs';

const redText = '\x1b[31m%s\x1b[0m';
const purpleText = '\x1b[35m%s\x1b[0m';
const greenText = '\x1b[32m%s\x1b[0m';

const connectToDataBaseSelected = mysql.createConnection(configMyDb);

const queryAsync = util.promisify(connectToDataBaseSelected.query).bind(connectToDataBaseSelected);
let object = {};
let dbConfig;
let tables;
let projectName;
let selectedTableName;
let numeric = ['tinyint', 'smallint', 'mediumint', 'int', 'bigint', 'serial', 'decimal', 'float', 'double', 'real'];
let bool = ['boolean', 'serial'];
let date = ['date', 'datetime', 'timestamp', 'time', 'year'];
let chaine = ['char', 'varchar', 'tinytext', 'text', 'mediumtext', 'longtext', 'binary', 'varbinary', 'tinyblob', 'blob', 'mediumblob', 'longblob'];
export default async function gatherDatabaseInfo() {

    try {
        connectToDataBaseSelected.connect();
        console.log(greenText, 'Connected to the database');

        const choices = await getProjectChoices();
      
        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'project',
                message: 'Choose a project:',
                choices: choices
            }
        ]);

        const selectedProjectId = answer.project;

        const getProjectName = 'SELECT name FROM project WHERE id_project = ?';
        const projectNameResult = await queryAsync(getProjectName, [selectedProjectId]);

        if (projectNameResult.length > 0) {
            projectName = projectNameResult[0].name;
            console.log('Name of the selected project:', projectName);
        } else {
            console.log('Project with the specified ID not found');
        }

        const projectPath = path.join(process.cwd(), projectName);
        if (!fs.existsSync(projectPath)) {
            console.log(redText, `Project ${projectName} does not exist anymore.`);
            process.exit(0);
        }
        
        const databaseInfo = await inquirer.prompt([
            {
                type: 'input',
                name: 'databaseHost',
                message: 'Enter the database host:'
            },
            {
                type: 'input',
                name: 'databaseUsername',
                message: 'Enter the database username:'
            },
            {
                type: 'password',
                name: 'databasePassword',
                message: 'Enter the database password:'
            },
            {
                type: 'input',
                name: 'databaseName',
                message: 'Enter the database name:'
            }
        ]);

        const { databaseHost, databaseUsername, databasePassword, databaseName } = databaseInfo;

        const sql = `
            UPDATE project
            SET database_host = ?,
                database_username = ?,
                database_password = ?,
                database_name = ?
            WHERE id_project = ?
        `;
        const values = [databaseHost, databaseUsername, databasePassword, databaseName, selectedProjectId];

        await queryAsync(sql, values);
        console.log(greenText, 'Database information updated successfully');
        //connection.end();

        dbConfig = {
            host: databaseHost,
            user: databaseUsername,
            password: databasePassword,
            database: databaseName,
        };

        const confirmAnswer = await inquirer.prompt({
            type: 'confirm',
            name: 'confirm',
            message: 'Do you want to connect to the database?'
        });

        if (confirmAnswer.confirm) {
            //fetchData(); // Redirect to fetchTables.js (adjust path accordingly)
            const connectToDataBaseSelected = mysql.createConnection(dbConfig);


            connectToDataBaseSelected.connect((err) => {
                if (err) {
                    console.error('Database connection error : ', err);
                    connectToDataBaseSelected.end();
                    process.exit(0);
                    
                }

                const showTablesQuery = 'SHOW TABLES';

                // Exécutez la requête
                connectToDataBaseSelected.query(showTablesQuery, (error, results) => {
                    if (error) {
                        throw error;
                    }

                    tables = results
                        .map(result => Object.values(result)[0])
                        .filter(tableName => !tableName.endsWith('_seq'));

                    // Affichez la liste des tables
                    console.log(purpleText, 'Tables available:');
                    tables.forEach((tableName, index) => {
                        console.info(`${index + 1}. ${tableName}`);
                    });

                    // Interface de lecture pour la saisie utilisateur
                    const rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });

                    // Demandez à l'utilisateur de choisir une table
                    rl.question('Please indicate the table number you would like to review: ', (choice) => {
                        const selectedTableIndex = parseInt(choice) - 1;

                        if (isNaN(selectedTableIndex) || selectedTableIndex < 0 || selectedTableIndex >= results.length) {
                            console.log(redText, 'Invalid choice. Closing the program.');
                            rl.close();
                            connectToDataBaseSelected.end();
                            return;
                        }

                        // Récupérez le nom de la table sélectionnée
                        selectedTableName = tables[selectedTableIndex];

                        // Affichez le nom de la table sélectionnée
                        console.log(greenText, `You have chosen the table: ${selectedTableName}`);

                        // Query pour obtenir les informations sur la table
                        const query = `DESCRIBE ${selectedTableName}`;

                        // Exécutez la requête
                        connectToDataBaseSelected.query(query, (error, results) => {
                            if (error) {
                                throw error;
                            }

                            afficherTableau(results);
                            console.info(object);
                            rl.close();
                            console.log(purpleText, `The HELP:`)
                            //connectToDataBaseSelected.end();
                            help();
                        });
                    });
                });

            });
        } else {
            console.log(purpleText, 'Exiting the program.');
            process.exit(0);
        }
    } catch (error) {
        console.error(redText, 'Error:', error);
    } finally {
        connectToDataBaseSelected.end();
    }
}

export { selectedTableName, projectName, object }

async function getProjectChoices() {
    try {
        const result = await queryAsync('SELECT id_project, name, frontend_technology, database_type FROM project');
        const choices = result.map(project => {


            const displayText = `name: ${project.name}, frontend_technology: ${project.frontend_technology}, database_type: ${project.database_type}`;

            return {
                name: displayText,
                value: project.id_project,
            };
        });

        return choices;
    } catch (error) {
        console.error('Error executing SQL query:', error);
        throw error;
    }
}

function afficherTableau(tableau) {
    // Longueur maximale de chaque colonne
    const largeurColonne1 = 15;
    const largeurColonne2 = 15;

    // Dessiner la bordure supérieure
    let ligneBordure = '╔' + '═'.repeat(largeurColonne1) + '╦' + '═'.repeat(largeurColonne2) + '╗';
    console.log(ligneBordure);

    // Afficher les en-têtes de colonnes
    console.log('║' + ' Champ'.padEnd(largeurColonne1) + '║' + ' Type '.padEnd(largeurColonne2) + '║');

    // Dessiner la ligne de séparation entre l'en-tête et les données
    console.log('╠' + '═'.repeat(largeurColonne1) + '╬' + '═'.repeat(largeurColonne2) + '╣');

    // Afficher les données
    tableau.forEach(row => {
        const typeWithoutParams = row.Type.split('(')[0].toLowerCase();
        console.log('║' + row.Field.toString().padEnd(largeurColonne1) + '║' + row.Type.toString().padEnd(largeurColonne2) + '║');
        if (numeric.includes(typeWithoutParams)) object[row.Field.toString()] = 'number';
        else if (bool.includes(typeWithoutParams)) object[row.Field.toString()] = 'boolean';
        else if (date.includes(typeWithoutParams)) object[row.Field.toString()] = 'Date';
        else if (chaine.includes(typeWithoutParams)) object[row.Field.toString()] = 'string';
        else object[row.Field.toString()] = 'unknown';
    });

    // Dessiner la bordure inférieure
    console.log('╚' + '═'.repeat(largeurColonne1) + '╩' + '═'.repeat(largeurColonne2) + '╝');
}
