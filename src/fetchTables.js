import mysql from 'mysql';
import path from 'path';
import fs from 'fs';
//import helpScript from './helpScript.js';

const redText = '\x1b[31m%s\x1b[0m';
const purpleText = '\x1b[35m%s\x1b[0m';

const frameworksFilePath = path.join(process.cwd(), 'frameworks.json');
let dbConfig;

export default function fetchData() {

    // Read the content of the frameworks.json file
    try {
        const data = fs.readFileSync(frameworksFilePath, 'utf8');
        const frameworksInfo = JSON.parse(data);
        console.log('infoooooooooooooooo : ', frameworksInfo);

        // Use the imported information to create dbConfig object
        dbConfig = {
            host: frameworksInfo.database_info.databaseHost,
            user: frameworksInfo.database_info.databaseUsername,
            password: frameworksInfo.database_info.databasePassword,
            database: frameworksInfo.database_info.databaseName,
        };

        // Now, you can use dbConfig for database configuration
        console.log('Database Configuration:', dbConfig);
    } catch (error) {
        console.error(`Error reading frameworks.json: ${error}`);
    }

    if (!dbConfig) {
        console.error(redText, 'Database configuration not available.');
        return;
    }

    // Créer une connexion à la base de données
    const connection = mysql.createConnection(dbConfig);

    // Se connecter à la base de données
    connection.connect((err) => {
        if (err) {
            console.error(redText, 'Erreur de connexion à la base de données : ', err);
            return;
        }

        // Requête pour récupérer les noms de tables
        const query = 'SHOW TABLES';

        // Exécuter la requête
        connection.query(query, (err, results) => {
            if (err) {
                console.error(redText, 'Erreur lors de l\'exécution de la requête : ', err);
                return;
            }

            // Extract the names of tables, excluding those ending with '_seq'
            const tables = results
                .map(result => Object.values(result)[0])
                .filter(tableName => !tableName.endsWith('_seq'));


            // Afficher les noms de tables
            console.log(purpleText, 'Names of tables : ', tables);

            //console.log(helpScript);
            // Fermer la connexion à la base de données
            connection.end();
        });
    });

}