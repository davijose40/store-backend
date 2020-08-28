'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Order = use('App/Models/Order')
const Service = use('App/Services/Order/OrderService')
const Database = use('Database')

/**
 * Resourceful controller for interacting with orders
 */
class OrderController {
  /**
   * Show a list of all orders.
   * GET orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   * @param {Object} ctx.pagination
   */
  async index({ request, response, pagination }) {
    const { status, id } = request.only(['status', 'id'])
    const query = Order.query()

    if (status && id) {
      query.where('status', status)
      query.orWhere('id', 'ILIKE', `%${id}%`)
    } else if (status) {
      query.where('status', status)
    } else if (id) {
      query.orWhere('id', 'ILIKE', `%${id}%`)
    }

    const orders = query.paginate(pagination.page, pagination.limit)

    return response.send(orders)
  }

  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    const trx = await Database.beginTransaction()

    try {
      const { user_id, items, status } = request.all()
      const order = await Order.create({ user_id, status }, trx)

      const service = new Service(order, trx)
      if (items && items.length > 0) {
        await service.syncItems(item)
      }

      await trx.commit()
      return response.status(201).send(order)
    } catch (error) {
      await trx.rollback()

      return response
        .status(400)
        .send({ message: 'Não foi possível criar o pedido no momento!' })
    }
  }

  /**
   * Display a single order.
   * GET orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params: { id }, response }) {
    const order = await Order.findOrFail(id)

    return response.send(order)
  }

  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params: { id }, request, response }) {
    const order = await Order.findOrFail(id)

    trx = await Database.beginTransaction()

    try {
      const { user_id, items, status } = request.all()
      order.merge({ user_id, status })

      const service = new Service(order, trx)

      await service.updateItems(items)

      await order.save(trx)

      await trx.commit()

      return response.send(order)
    } catch (error) {
      await trx.rollback()

      return response
        .status(400)
        .send({ message: 'Não foi possível atualizar o pedido nesse momento!' })
    }
  }

  /**
   * Delete a order with id.
   * DELETE orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params: { id }, request, response }) {
    const order = await Order.findOrFail(id)

    const trx = await Database()

    try {
      await order.items().delete(trx)

      await order.coupons().delete(trx)

      await order.delete(trx)

      await trx.commit()

      return response.status(204).send()
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        message: 'Erro ao deletar esse pedido!',
      })
    }
  }
}

module.exports = OrderController
