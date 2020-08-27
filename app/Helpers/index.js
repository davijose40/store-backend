'use stric'

const crypto = use('crypto')
// eslint-disable-next-line no-unused-vars
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

/**
 * Move um único arquivo para o caminho especificado, se nenhum for especificado
 * então o caminho "public/uploads" será utilizado,
 *
 * @param { FileJar } file o arquivo a ser gerenciado
 * @param { string } path o caminho para onde o arquivo deve movido
 * @return { Object<FileJar> }
 */

const manage_single_upload = async (file, path = null) => {
  path = path || Helpers.publicPath('uploads')
  const random_name = await str_random(30)
  const filename = `${new Date().getTime()}-${random_name}.${file.subtype}`

  // renomeia o arquivo e move ele para o path
  await file.move(path, {
    name: filename,
  })
  return file
}

/**
 * Move um único arquivo para o caminho especificado, se nenhum for especificado
 * então o caminho "public/uploads" será utilizado,
 *
 * @param { FileJar } file o arquivo a ser gerenciado
 * @param { string } path o caminho para onde o arquivo deve movido
 * @param { Object }
 */
const manage_multiple_uploads = async (fileJar, path = null) => {
  path = path || Helpers.publicPath('uploads')
  const successes = []
  const errors = []

  await Promise.all(
    fileJar.files.map(async file => {
      const random_name = await str_name(30)
      const filename = `${new Date().getTime()}-${random_name}.${file.subtype}`

      // move o arquivo
      await file.move(path, {
        name: filename,
      })

      // verificamos se realmente moveu
      if (file.moved()) {
        successes.push(file)
      } else {
        errors.push(file.error())
      }
    }),
  )

  return { successes, errors }
}

module.exports = {
  str_random,
  manage_single_upload,
  manage_multiple_uploads,
}
