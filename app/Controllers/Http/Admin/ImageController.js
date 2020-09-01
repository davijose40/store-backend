'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

// import Models image
const fs = use('fs')
const Image = use('App/Models/Image')
const Transformer = use('App/Transformer/Admin/ImageTransformer')
const { manage_single_upload, manage_multiple_uploads } = use('App/Helpers')

/**
 * Resourceful controller for interacting with images
 */
class ImageController {
  /**
   * Show a list of all images.
   * GET images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   * @param {Object} ctx.pagination
   */
  async index({ response, pagination, transform }) {
    let images = await Image.query()
      .orderBy('id', 'DESC')
      .paginate(pagination.page, pagination.limit)

    images = await transform.paginate(images, Transformer)

    return response.send(images)
  }

  /**
   * Create/save a new image.
   * POST images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, transform }) {
    try {
      // captura uma imagem ou mais do request
      const fileJar = request.file('images', {
        types: ['image'],
        size: '2mb',
      })

      // retorno do usuário
      const images = []
      // caso seja um unico arquivo - manage_single_upload
      if (!fileJar.files) {
        const file = await manage_single_upload(fileJar)

        if (file.moved()) {
          const image = await Image.create({
            path: file.fileName,
            size: file.size,
            original_name: file.clientName,
            extension: file.subtype,
          })

          const transformedImage = await transform.item(image, Transformer)

          images.push(transformedImage)

          return response.status(201).send({ successes: images, errors: {} })
        }

        return response.status(400).send({
          message: 'Erro ao carregara a image, por favor tente novamente.',
        })
      }

      // caso sejam vários arquivos - manage_multiple_uploads
      const files = await manage_multiple_uploads(fileJar)

      await Promise.all(
        files.successes.map(async file => {
          const image = await Image.create({
            path: file.fileName,
            size: file.size,
            original_name: file.clientName,
            extension: file.subtype,
          })

          const transformedImage = await transform.item(image, Transformer)

          images.push(transformedImage)
        }),
      )

      return response
        .status(201)
        .send({ successes: image, errors: files.errors })
    } catch (error) {
      return response
        .status(400)
        .send({ message: 'Não foi possível processar a sua solicitação!' })
    }
  }

  /**
   * Display a single image.
   * GET images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params: { id }, transform, response }) {
    let image = await Image.findOrFail(id)

    image = await transform.item(image, Transformer)

    return response.send(image)
  }

  /**
   * Update image details.
   * PUT or PATCH images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params: { id }, request, response, transform }) {
    let image = await Image.findOrFail(id)
    try {
      image.merge(request.only(['original_name']))
      await image.save()
      image = await transform.item(image, Transformer)
      return response.status(200).send(image)
    } catch (error) {
      return response.status(400).send({
        message: 'Não foi possível atualizar o nome da imagem nesse momento!',
      })
    }
  }

  /**
   * Delete a image with id.
   * DELETE images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params: { id }, request, response }) {
    const image = await Image.findOrFail(id)
    try {
      const filepath = Helpers.publicPath(`uploads/${image.path}`)

      fs.unlinkSync(filepath)
      await image.delete()

      return response.status(204).send()
    } catch (error) {
      return response.status(400).send({
        message: 'Não foi possível deletar a imagem no momento!',
      })
    }
  }
}

module.exports = ImageController
