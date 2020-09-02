'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {
  /**
   * Categories resources routes
   */
  Route.resource('categories', 'CategoryController')
    .apiOnly()
    .validator(
      new Map([
        [['categories.store'], ['Admin/StoreCategory']],
        [['categories.update'], ['Admin/StoreCategory']],
      ]),
    )

  /**
   *  Product resource routes
   */
  Route.resource('products', 'ProductController').apiOnly()

  /**
   *  Coupon resource routes
   */
  Route.resource('coupons', 'CouponController').apiOnly()

  /**
   *  Order resource routes
   */
  Route.post('orders/:id/discount', 'OrderController.applyDiscount')
  Route.delete('orders/:id/discount', 'OrderController.removeDiscount')
  Route.resource('orders', 'OrderController')
    .apiOnly()
    .validator(new Map([[['ordes.store'], ['Admin/StoreOrder']]]))

  /**
   *  Image resource routes
   */
  Route.resource('images', 'ImageController').apiOnly()

  /**
   *  User resource routes
   */
  Route.resource('users', 'UserController')
    .apiOnly()
    .validator(
      new Map([
        [['users.store'], ['Admin/StoreUser']],
        [['users.update'], ['Admin/StoreUser']],
      ]),
    )

  /**
   *  Dashboard Route
   */
  Route.get('dashboard', 'DashboardController.index').as('dashboard')
})
  .prefix('v1/admin')
  .namespace('Admin')
  .middleware(['auth', 'is:( admin || manager )'])
