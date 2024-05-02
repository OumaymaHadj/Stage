import path from 'path';
import fs from 'fs';
import util from 'util';

const writeFileAsync = util.promisify(fs.writeFile);

export default async function updataAppConfig() {

    const configFilePath = path.join(process.cwd(), 'src/app/app.config.ts');
    const fileContent = generateConfigContent();
    await writeFileAsync(configFilePath, fileContent);
    console.log('app.config.ts updated successfully.');
}

function generateConfigContent() {
    const content = `
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';


export const appConfig: ApplicationConfig = {
    providers: [provideRouter(routes), provideHttpClient()],
};`

    return content;

}