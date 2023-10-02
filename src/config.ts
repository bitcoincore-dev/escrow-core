const _MIN  =  60
const _HOUR = _MIN  * 60
const _DAY  = _HOUR * 24

export const MIN_WINDOW   = _HOUR * 2
export const MAX_WINDOW   = _DAY  * 30
export const GRACE_PERIOD = _DAY  * 2
export const MAX_MULTISIG = 100
export const STAMP_THOLD  = 500_000_000

export const DEFAULT_DEADLINE = MIN_WINDOW
export const DEFAULT_EXPIRES  = MIN_WINDOW
