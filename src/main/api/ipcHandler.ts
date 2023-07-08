import { app, ipcMain } from 'electron';
import { POWERSHELL_CMD } from '../constants/constant';
import { executeCmd, batchInstall } from '../utils';
import { startUpdate } from '../utils/appUpdater';


export const routeHandler = (adbPath: string) => {
    // listen for messages from renderer at these routes

    ipcMain.on('shellChannel', (event, args: string) => {
        let command = args;

        console.log(command);

        if (command === 'powershell') {
            command = POWERSHELL_CMD;
            executeCmd(command, event, 'shellResponse');
        } else if (command === 'update') {
            event.reply('shellResponse', 'starting update');
            startUpdate().then(() => {
                if (process.platform !== 'win32')
                    event.reply('shellResponse', 'update complete');
            });
        } else {
            executeCmd(command, event, 'shellResponse');
        }

    });

    ipcMain.on('adbChannel', async (event, args: string) => {
        const command = `${adbPath}${args}`;
        console.log(command);

        if (args === 'batchInstall') {
            console.log('batchInstall');

            batchInstall(adbPath, event);
        } else {
            executeCmd(command, event, 'adbResponse');
        }

    });

    ipcMain.on('communicationChannel', async (event, args) => {
        console.log('hit coms');

        try {
            if (args.includes('restart')){
                event.reply('messageResponse', 'restarting');
                app.relaunch();
                app.exit();
            }
        } catch (error: any) {
            console.log(error);
            event.reply('messageResponse', error.message);
        }
    });
};

