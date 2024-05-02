import inquirer from 'inquirer';
import initializeProject from './createProject.js';
import gatherDatabaseInfo from './databaseInfo.js'
import createComponent from './createComponents.js';
import sendMessageToChatGPT from './chatGPTReq.js';



export default function help() {
  const commands = [
    { name: 'Create a new project', value: 'createProject' },
    { name: 'Establish database connection', value: 'connectDB' },
    { name: 'Create Model, Service and Component for a spesific table', value: 'createComponent' },
    { name: 'Send request to chatGpt', value: 'chatWithGPT' }
  ];

  // Function to execute the selected command
  function executeCommand(command) {

    switch (command) {
      case 'createProject':
        initializeProject();
        break;

      case 'connectDB':
        gatherDatabaseInfo();
        break;

      case 'createComponent':
        createComponent();
        break;
      case 'chatWithGPT':
        sendMessageToChatGPT();
        break;
        
    }

  }
  inquirer.prompt([
    {
      type: 'list',
      name: 'command',
      message: 'Choose a command:',
      choices: commands
    }
  ]).then(answers => {
    executeCommand(answers.command);
  });
}