import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'src/js/main.js',
  dest: 'dist/js/main.js',
  format: 'iife',
  sourceMap: 'inline',
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true
    }),

    commonjs({
      sourceMap: true
    })
  ]
}
