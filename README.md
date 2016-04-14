# Electron GHSTS POC 

This project was to help boostrap the development of a desktop application based on GHSTS standard XML Schema.
The JS application is based on App Boilerplate for Electron. The orginal work for the boilerplate was done by Thorsten Hans.

## PreConditions for client

Ensure that the following node packages are installed on your system

 * jspm and electron_prebuilt

you can install it using `npm install jspm -g` and 'npm install electron-prebuilt -g'

## Install dependencies

After cloning the repo execute `npm install` in 'app' subdirectory to install all dependencies. For the client, `jspm install` will be invoked automatically as `npm postinstall` script!

## Run the application

type 'electron app'

## Creating the Electorn App package

Execute `gulp` in order to build the electron app.

The final electron app will be located as a zip file within the `dist` subfolder. Extract the ZIP file and start the electron app.

