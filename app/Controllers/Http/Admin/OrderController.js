'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Order = use('App/Models/Order')
const Service = use('App/Services/Order/OrderService')
const Database = use('Database')
const Coupon = use('App/Models/Coupon')
const Discount = use('App/Models/Discount')
const Transformer = use('App/Transformers/Admin/OrderItemTransformer')

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
   * @param {TransformWith} ctx.transform
   */
  async index({ request, response, pagination, transform }) {
    const { status, id } = request.only(['status', 'id'])
    const query = Order.query()

    if (status && id) {
      query.where('status', status)
      query.orWhere('id', 'ILIKE', `%${id}%`)
    } else if (status) {
      query.where('status', status)
    } else if (id) {
      query.where('id', 'ILIKE', `%${id}%`)
    }

    let orders = await query.paginate(pagination.page, pagination.limit)

    orders = await transform.paginate(orders, Transformer)

    return response.send(orders)
  }

  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformWith} ctx.transform
   */
  async store({ request, response, transform }) {
    const trx = await Database.beginTransaction()

    try {
      const { user_id, items, status } = request.all()
      const order = await Order.create({ user_id, status }, trx)

      const service = new Service(order, trx)
      if (items && items.length > 0) {
        await service.syncItems(items)
      }

      await trx.commit()

      // order = await transform.item(order, Transformer)

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
   * @param {TransformWith} ctx.transform
   */
  async show({ params: { id }, response, transform }) {
    let order = await Order.findOrFail(id)

    order = await transform.item(order, Transformer)

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
  async update({ params: { id }, request, response, transform }) {
    let order = await Order.findOrFail(id)

    trx = await Database.beginTransaction()

    try {
      const { user_id, items, status } = request.all()
      order.merge({ user_id, status })

      const service = new Service(order, trx)

      await service.updateItems(items)

      await order.save(trx)

      await trx.commit()

      order = await transform.item(order, Transformer)

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

  async applyDiscount({ params: { id }, request, response }) {
    const { code } = request.all()
    const coupon = await Coupon.findByOrFail('code', code.toUpperCase())
    const order = await Order.findOrFail(id)

    var info = {
      message: '',
      success: '',
    }

    // eslint-disable-next-line no-unused-vars
    let discount = {}

    try {
      const service = new Service(order)
      const canAddDiscount = await service.canApplyDiscount(coupon)
      const orderDiscounts = await order.coupons().getCount()

      const canApplyToOrder =
        orderDiscounts < 1 || (orderDiscounts >= 1 && coupon.recursive)

      if (canAddDiscount && canApplyToOrder) {
        discount = await Discount.findOrCreate({
          order_id: order.id,
          coupon_id: coupon.id,
        })

        info.message = 'Cupom aplicado com sucesso!'
        info.success = true
      } else {
        info.message = 'Não foi possível aplicar esse cupom!'
        info.success = false
      }

      return response.send({ order, info })
    } catch (error) {
      // error
      return response.status(400).send({ message: 'Erro ao aplicar o cupom!' })
    }
  }

  async removeDiscount({ request, response }) {
    const { discount_id } = request.all()

    const discount = await Discount.findOrFail(discount_id)

    await discount.delete()

    return response.status(204).send()
  }
}

module.exports = OrderController
