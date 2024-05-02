import fs from 'fs';
import path from 'path';
import { selectedTableName } from './databaseInfo.js';
import { nameComponentMaj } from './createComponents.js';
import  updataAppConfig  from './auto-config.js';

let updatedFileContent;

export default function watcherForUpdate() {

    const routesFilePath = path.join(process.cwd(), '/src/app/app.routes.ts');

    const importStatement = `import { ${nameComponentMaj}Component } from './${selectedTableName}/${selectedTableName}.component';`;


    fs.readFile(routesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading routes file:', err);
            return;
        }

        if (!data.includes(importStatement)) {

            updatedFileContent = `${importStatement}\n${data}`;
            data = updatedFileContent;
            
            fs.writeFile(routesFilePath, updatedFileContent, 'utf8', (err) => {
                if (err) {
                    console.error('Error updating routes file with import statement:', err);
                    return;
                }
                console.log(`Imported ${nameComponentMaj}Component into app.routes.ts`);
            });
        }

        const newRouteEntry = `  { path: '${selectedTableName.toLowerCase()}', component: ${nameComponentMaj}Component },`;
        const updatedRoutes = data.replace('export const routes: Routes = [', `export const routes: Routes = [\n${newRouteEntry}`);

        fs.writeFile(routesFilePath, updatedRoutes, 'utf8', (err) => {
            if (err) {
                console.error('Error updating routes file:', err);
                return;
            }
            console.log(`\x1b[1mRoute added for '${selectedTableName}' component in app.routes.ts`);
        });       
    });

    updataAppConfig();
}