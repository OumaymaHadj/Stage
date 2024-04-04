import initializeProject from './createProject.js';

const showCommands = () => {
    console.log(`
  List of Commands:
  
  1. 'createProject':
     Create a specific project.
  
     Example:
     createProject 
  
  2. 'cofigureDB':
     Configuration of your database.
  
     Example:
     configureDB  nameOfProject
  
  3. 'connectDB':
     Access to your database.
  
     Example:
     connectDB nameOfProject
    `);
};

// Parse command line arguments
const command = process.argv[2];

// Perform actions based on the command
switch (command) {
    case 'createProject':
        console.log("Create a specific project...");
        initializeProject();
        break;

    case 'cofigureDB':
        console.log("Configuration of your database...");
        // Implement logic to show tables here
        break;

    case 'connectDB':
        console.log("Access to your database...");
        // Implement logic to extract fields and types here
        break;

    case 'help':
        showCommands();
        break;

    default:
        console.log("Invalid command. Please use one of the following commands:");
        showCommands();
        break;
}
