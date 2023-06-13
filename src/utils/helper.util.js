const buildKeyString = (resultRows) => {
  let keyString = ''
  for (const row in resultRows) {
    if (resultRows[row].id) {
      keyString += resultRows[row].id
    }
  }

  return keyString
}

const buildLoggingStr = (message, opts) => {
  if (opts) {
    if (opts.payload) {
      return `${message} : ${opts.payload}`
    }
  }

  return `${message}`
}

module.exports = {
  buildKeyString,
  buildLoggingStr
}
