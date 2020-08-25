'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Category extends Model {
  /*
    relacionamento entre Category e Image
  */
  image() {
    return this.belongsTo('App/Models/Image')
  }

  /*
  relacionamento entre Category and Product
  */
  products() {
    return this.belongsToMany('App/Models/Product')
  }
}

module.exports = Category
