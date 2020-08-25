'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Product extends Model {
  image() {
    return this.belongsTo('App/Models/Image')
  }

  /**
   * relacionamento entre podutos e images(Galeria de images do produto)
   */

  images() {
    return this.belongsToMany('App/Models/Image')
  }

  /**
   * Relacionamento entre produtos e categorias
   */
  categories() {
    return this.belongsToMany('App/Models/Category')
  }

  /**
   * Reloacionamento entre produtos e cupons de desconto
   */
  coupons() {
    return this.belongsToMany('App/Models/Coupon')
  }
}

module.exports = Product
