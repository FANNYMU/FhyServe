const { app, dialog, shell, Menu } = require('electron');
const axios = require('axios');
const { checkForUpdates } = require('../../utils/checkUpdate');
const { backupResources } = require('../../utils/backupResource');
const { importResources } = require('../../utils/importResource');
const { stopAllTunnels } = require('../../utils/tunnels');
const { createDocsWindow } = require('../docsWindow');
const { stopApache } = require('../../runtime/apache');
const { stopMysql } = require('../../runtime/mysql');
const { stopNginx } = require('../../runtime/nginx');
const { stopNodeServer } = require('../../runtime/node');
const { stopPython } = require('../../runtime/python');
const { stopGoServer } = require('../../runtime/go');
const { stopCmd } = require('../../runtime/cmd');
const { stopAllCronJobs } = require('../../runtime/cronjob');
const { createBrowserWindow } = require('../../screen/browserWindow');

async function stopAllServices() {
  await Promise.all([
    stopApache(),
    stopMysql(),
    stopNginx(),
    stopNodeServer(),
    stopPython(),
    stopGoServer(),
    stopCmd(),
    stopAllCronJobs(),
	stopAllTunnels(),
  ]);
}

async function restartApp() {
  try {
    await stopAllServices();
  } catch (err) {
    console.error('Failed to stop some services:', err);
  }
  app.relaunch();
  app.exit(0);
}

function createMainMenu(win) {
  const template = [
    {
      label: 'File',
      submenu: [
	    {
          label: 'Fullscreen',
          accelerator: process.platform === 'darwin' ? 'Cmd+Ctrl+F' : 'F11',
          click: () => win.setFullScreen(!win.isFullScreen()),
        },
		{ role: 'reload' },
        {
          label: 'Restart',
          accelerator: process.platform === 'darwin' ? 'Cmd+Shift+R' : 'Ctrl+Shift+R',
          click: () => {
            restartApp();
          }
        },
		//{
		//  label: 'Developer Tools',
		//  accelerator: process.platform === 'darwin' ? 'Cmd+Alt+I' : 'Ctrl+Shift+I',
		//  click: () => win.webContents.toggleDevTools(),
		//},
        { role: 'quit' },
      ],
    },
	{
	  label: 'Resources',
      submenu: [
		{
		  label: 'Backup',
		  click: () => {
		    backupResources(win);
		  }
		},
		{
		  label: 'Import',
		  click: () => {
		    importResources(win);
		  }
		},
      ],
	},
	{
	  label: 'Documentation',
	  click: () => {
	    createDocsWindow();
	  },
	},
    {
      label: 'Help',
      submenu: [
        {
          label: 'Check for Updates',
          click: () => checkForUpdates(win),
        },
		{
		  label: 'About',
		  click: async () => {
			const result = await dialog.showMessageBox(win, {
			  type: 'info',
			  title: 'About',
			  message: 'FhyServe is a portable multi-server runtime platform designed to simplify local web application development without the need for global installation. Allows you to run multiple environments.',
			  buttons: ['Visit GitHub', 'Visit Website', 'Close'],
			  defaultId: 0,
			});

			if (result.response === 0) {
			  shell.openExternal('https://github.com/fitri-hy');
			} else if (result.response === 1) {
              shell.openExternal('https://fhylabs.com');
            }
		  }
		},
      ],
    },
	{
	  label: 'Browser',
	  click: () => {
	    createBrowserWindow();
	  },
	},
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = { createMainMenu, checkForUpdates };
