import $lodash from "lodash"

declare global {
  const global: typeof window
  const _: typeof $lodash
  const langEngine: { language: string }

  function $act<R>(block: () => R): R
  function $let<T, R>(value: T, block: (it: T) => R): R
  function $also<T>(value: T, block: (it: T) => void): T
  function $opt<T, R, S>(value: T, someTrans: (it: T) => R, noneTrans: () => S): R | S

  function delay(ms: number): Promise<void>
}

window["global"] = window
const GLOBAL_UTILS_KEY = "__GLOBAL_UTILS_KEY__"
if (!global[GLOBAL_UTILS_KEY]) {
  global[GLOBAL_UTILS_KEY] = true

  global["langEngine"] = { language: "en" }

  global["_"] = $lodash
  global["$act"] = (block) => block()
  global["$opt"] = (value, someTrans, noneTrans) => (value === null || value === undefined ? noneTrans() : someTrans(value))
  global["$let"] = (value, block) => block(value)
  global["$also"] = (value, block) => (block(value), value)

  global["delay"] = async (ms) => new Promise((resolve) => setTimeout(resolve, ms))
}
