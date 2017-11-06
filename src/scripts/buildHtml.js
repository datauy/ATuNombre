#!/usr/bin/env node

'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const pp = require( 'preprocess' );

const from = "./src";
const to = "./dist";

// Loop through all the files in the temp directory
fs.readdir( from, function( err, files ) {
    if( err ) {
        console.error( "Could not list the directory.", err );
        process.exit( 1 );
    }

    files.forEach( function( file, index ) {
        // Make one pass and make the file complete
        var fromPath = path.join( fs.realpathSync(from), file );
        var toPath = path.join( fs.realpathSync(to), file );

        fs.stat( fromPath, function( error, stat ) {
            if( error ) {
                console.error( "Error stating file.", error );
                return;
            }

            if( stat.isFile() && file.indexOf('.html') !== -1 ) {
                pp.preprocessFileSync(fromPath, toPath, {});
            }
        } );
    } );
} );
