'use stric'

const crypto = use('crypto')
const Helpers = use('Helpers')

/**
 *  Generate rando string
 *
 * @param { int } length => O tamanho da string que você quer gerar
 * @return { string } => uma string nadomica do tamanho que length
 *
 */

const str_random = async (length = 40) => {
  let string = ''
  const len = string.length

  if (len < length) {
    const size = length - len
    const bytes = await crypto.randomBytes(size)
    const buffer = Buffer.from(bytes)
    string += buffer
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substr(0, size)
  }
  return string
}

module.exports = {
  str_random,
}
