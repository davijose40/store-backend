'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Order extends Model {
  /**
   * relacionamentos entre orders e items
   */
  items() {
    return this.hasMany('App/Models/OrderItem')
  }

  /**
   * relacionamentos entre orders e coupons
   */
  coupons() {
    return this.belongsToMany('App/Models/Coupon')
  }

  /**
   * relacionamentos entre orders e discounts
   */
  discounts() {
    return this.hasMany('App/Models/Discount')
  }

  /**
   * relacionamentos entre orders e discounts
   */
  user() {
    return this.belongsTo('App/Models/User', 'user_id', 'id')
  }
}

module.exports = Order
