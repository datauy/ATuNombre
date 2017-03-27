# A TU NOMBRE

## Developing

You'll need to have Node.js installed on your machine. If don't have it, go to the Node.js [website](https://nodejs.org/en/) and download it to your machine.

Clone this repository on your machine, cd into de folder and run ```npm install```.

Run ```npm run dev``` and check it out in your browser using the url [http://localhost:8080](http://localhost:8080).

## Testing

### Running and writting tests

Once you run ```npm test``` for the first time, you'll notice a new folder named __test__ is created inside the root directory. Don't modify it manually. Write your tests inside the __src__ directory, in a sibling file named ```<some_name>.spec.js``` next to the ```<some_name>.js``` file with code you want to test.

To get your tests running on the fly everytime you modify your source or test files, run ```npm run dev``` or ```npm run watch:test```.
