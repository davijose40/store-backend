'use strict'

const DB = use('Database')

class DashboardController {
  async index({ response }) {
    let users = await DB.from('users').getCount()
    let orders = await DB.from('orders').getCount()
    let products = await DB.from('products').getCount()

    const subtotal = await DB.from('order_items').getSum('subtotal')
    const discounts = await DB.from('coupon_order').getSum('discount')
    const revenues = subtotal - discounts

    users = parseInt(users)
    orders = parseInt(orders)
    products = parseInt(products)
    return response.send({ users, orders, products, revenues })
  }
}

module.exports = DashboardController
