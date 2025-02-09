import { z } from 'zod'
import base  from './base.js'

const { hash, label, literal, num, stamp, str } = base

const action    = z.enum([ 'lock', 'release', 'dispute', 'resolve', 'close' ])
const commit    = z.tuple([ num, num, hash, hash, label, num ])
const store     = z.tuple([ label, str ])
const vm_status = z.enum([ 'init', 'open', 'hold', 'disputed', 'closed' ])
const entry     = z.tuple([ stamp, action, label, str ]).rest(literal)

const data = z.object({
  action,
  stamp,
  args    : literal.array(),
  path    : str,
  prog_id : hash,
  wid     : hash
})

const vm_state = z.object({
  commits : commit.array(),
  head    : hash,
  paths   : z.tuple([ str, num ]).array(),
  result  : label.nullable(),
  start   : stamp,
  steps   : num.max(255),
  store   : store.array(),
  status  : vm_status,
  updated : stamp
})

export default { action, commit, data, entry, store, vm_state, vm_status }

