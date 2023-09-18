const _MIN  =  60
const _HOUR = _MIN  * 60
const _DAY  = _HOUR * 24

export default {
  MIN_WINDOW   : _HOUR * 2,
  MAX_WINDOW   : _DAY  * 30,
  GRACE_PERIOD : _DAY  * 2,
  MAX_MULTISIG : 100
}
