import mysql from 'mysql';

export const configMyDb = {
    host: 'localhost',
    user: 'phpmyadmin',
    password: 'oumayma',
    database: 'db_framework'
}

export const connection = mysql.createConnection(configMyDb);