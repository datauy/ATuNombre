#!/usr/bin/env node

const originFolder = './src/data/'
const destFolder = './dist/data/'
const fs = require('fs')

fs.readdirSync(originFolder).forEach(file => {
    fs.readFile(originFolder+file, 'utf8', (err,data) => {
        if (err) {
            return console.log(err);
        }
        fs.writeFile(destFolder+file, JSON.stringify(JSON.parse(data)), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log(file);
        });
    });
})



