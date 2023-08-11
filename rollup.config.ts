// rollup.config.ts
import typescript  from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'

const treeshake = {
	moduleSideEffects       : false,
	propertyReadSideEffects : false,
	tryCatchDeoptimization  : false
}

const onwarn = warning => { throw new Error(warning) }

const tsConfig = { 
  compilerOptions: {
    declaration    : false,
    declarationDir : null,
    declarationMap : false
  }
}

export default {
  input: 'src/index.ts',
  onwarn,
  output: [
    {
      file: 'dist/module.mjs',
      format: 'es',
      sourcemap: true,
      minifyInternalExports: false
    }
  ],
  plugins: [ typescript(tsConfig), nodeResolve() ],
  strictDeprecations: true,
  treeshake
}
