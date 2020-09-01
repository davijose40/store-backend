'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

/**
 * OrderTransformer class
 *
 * @class OrderTransformer
 * @constructor
 */
class OrderTransformer extends BumblebeeTransformer {
  static get availableInclude() {
    return ['user', 'coupons', 'items', 'discounts']
  }

  /**
   * This method is used to transform the data.
   */
  transform(order) {
    order = order.toJSON()
    return {
      // add your transformation object here
      id: order.id,
      status: order.status,
      total: order.total ? parseFloat(order.total.toFixed(2)) : 0,
      date: order.created_at,
      discount:
        order.__meta__ && order.__meta__.discount ? order.__meta__.discount : 0,
      subtotal:
        order.__meta__ && order.__meta__.subtotal ? order.__meta__.subtotal : 0,
      qty_items:
        order.__meta__ && order.__meta__.qty_items
          ? order.__meta__.qty_items
          : 0,
    }
  }

  includeUser(order) {
    return this.item(order.getRelated('user'), UserTransformer)
  }

  includeItems(order) {
    return this.collection(order.getRelated('items'), OrderItemTransformer)
  }

  includeCoupons(order) {
    return this.collection(order.getRelated('coupons'), CouponTransformer)
  }

  includeDiscounts(order) {
    return this.collection(order.getRelated('discounts'), DiscountTransformer)
  }
}

module.exports = OrderTransformer
