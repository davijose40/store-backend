'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Coupon extends Model {
  static get dates() {
    return ['created_at', 'updated_at', 'valid_from', 'valid_until']
  }

  /**
   * relacionamento Coupons com usuarios
   */
  users() {
    return this.belongsToMany('App/Models/User')
  }

  /**
   * relacionamento Coupons com products
   */
  products() {
    return this.belongsToMany('App/Models/Product')
  }

  /**
   * relacionamento Coupons com orders
   */
  orders() {
    return this.belongsToMany('App/Models/Order')
  }
}

module.exports = Coupon
