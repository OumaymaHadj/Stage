import fs from 'fs';
import path from 'path';
import help from './help.js';

export default function welcome() {

    const configFile = path.join(process.cwd(), 'config.json');

    fs.readFile(configFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading config file:', err);
            return;
        }

        const config = JSON.parse(data);

        if (!config.welcomeShown) {

            const welcomeMessage = `
    \x1b[33m\x1b[1mWelcome to the Interface Generator Framework!\x1b[0m

    \x1b[33mThe goal of this framework is to generate user interfaces from your data model
    to facilitate development and save your energy for specific tasks of your project.\x1b[0m

    \x1b[33mHere's a quick guide to get started:\x1b[0m
    \x1b[33m1. Create a new project.\x1b[0m
    \x1b[33m2. Connect to your database.\x1b[0m
    \x1b[33m3. Generate components based on your data model.\x1b[0m

    \x1b[33mImportant Note:\x1b[0m
    \x1b[33mYou cannot generate components directly; you must establish a new connection each time.\x1b[0m

    \x1b[33mHappy coding!\x1b[0m
    `;

            console.log(welcomeMessage);

            config.welcomeShown = true;
            fs.writeFile(configFile, JSON.stringify(config, null, 2), (err) => {
                if (err) {
                    console.error('Error updating config file:', err);
                }
            });
            help();
        } else {

            help();

        }
    });
}

