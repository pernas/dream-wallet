
export const makeNamespace = (ns) => (type) => `${ns}.${type}`

export const randStr = () => Math.random().toString(36).slice(2)

export const stringify = (o) => JSON.stringify(o)
