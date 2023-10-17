// rollup.config.ts
import typescript  from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'

const treeshake = {
	moduleSideEffects       : false,
	propertyReadSideEffects : false,
	tryCatchDeoptimization  : false
}

const onwarn = warning => {
  if (
    warning.code === 'INVALID_ANNOTATION' && 
    warning.message.includes('@__PURE__')
  ) {
    return
  }

  throw new Error(warning)
}

export default {
  input: 'src/index.ts',
  onwarn,
  output: [
    {
      file: 'dist/module.mjs',
      format: 'es',
      sourcemap: true,
      minifyInternalExports: true
    }
  ],
  plugins: [ typescript(), nodeResolve() ],
  strictDeprecations: true,
  treeshake
}
