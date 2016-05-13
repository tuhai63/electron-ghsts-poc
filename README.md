# Electron GHSTS POC 

This project was to help boostrap the development of a desktop application based on GHSTS standard XML Schema.
The ES6 application is based on the App Boilerplate for Electron by Thorsten Hans. For more details on his original work, see the post on his blog https://www.xplatform.rocks/2015/05/04/writing-an-electron-atom-shell-app-using-angular-and-es6/. Other useful reference resouces can be found on the site of JSPM.io (http://jspm.io/), including a good introduction to JSPM at: http://developer.telerik.com/featured/choose-es6-modules-today.

## Components and Features

This POC uses the following components and features:

 * Electron
 * Angular 1.x (Angular 2.0 is still in beta at this moment)
 * ES6
 * Angular Material
 * XML2JS
 * NoSQL Javascript Database NeDB

## PreConditions for client

Ensure that the following node packages are installed on your system.

 * jspm and electron_prebuilt

You can install it using `npm install jspm -g` and `npm install electron-prebuilt -g`. 
It is advisable to locally install jspm in additional to globally installing it to lock the version of jspm for a specific project. 
Go to app directory and run `npm install jspm`.

## Install dependencies

After cloning the repo execute `npm install` in 'app' subdirectory to install all dependencies. For the client, `jspm install` will be invoked automatically as `npm postinstall` script!
Since this POC will be refreshed with new dependencies added, please make sure you run `npm install` every time you pull from repository.

## Run the application

Go to the parent directory of 'app' folder, type `electron app`.


## Debug the browser process 

You can easily debug the browser process of the application with built-in Chrome debugger. Once the application is running, go to menu 'View->Toggle Developer Tools'.

## Debug the main process

You can debug the main process of the application with Visual Studio Code. Go to the parent directory of app, type 'electron -debug app'.  In Visual Studio Code, start debugger by 'Attach'. For electron document on this subject, go to http://electron.atom.io/docs/v0.33.0/tutorial/debugging-main-process/.

## Creating the Electorn App package

Execute `gulp` in order to build the electron app.

The final electron app will be located as a zip file within the `dist` subfolder. Extract the ZIP file and start the electron app.

