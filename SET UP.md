# Instructions of setting up admin interface

## Table of contents

- [Prequisite](#Prequisite)
- [Installation](#Installation)
- [Commands](#Commands)
- [Notes](#Notes)

## Prequisite

- Node.js version 24.6 (latest)
Check your Node.js version
'''
node -v
'''

'''
npm-v
'''

## Installation

- Replace your existing "package.json" and "package-lock.json" with the ones provided in Github 

- Replace your existing src/ folder with the uploaded src/ folder from Github

## Commands

Install dependencies
'''
npm install
'''

Run the program
'''
npm start
'''

## Notes

Do not copy the node_modules/ folder. It will be generated automatically when you run npm install.

If you run into version issues, delete the node_modules/ folder and package-lock.json, then run npm install again.

To stop the development server, press Ctrl + C in the terminal.

Directory for Admin Inter: src/Components/Admin.js

To reach admin page, on your local device go to: http://localhost:3000
