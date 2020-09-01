'use strict'

const Database = use('Database')

class OrderService {
  constructor(model, trx = false) {
    this.model = model
    this.trx = trx
  }

  async syncItems(items) {
    if (!Array.isArray(items)) {
      return false
    }

    await this.model.items().delete(this.trx)
    await this.model.items().createMany(items, this.trx)
  }

  async updateItems(items) {
    const currentItems = await this.model
      .items()
      .whereIn(
        'id',
        items.map(item => item.id),
      )
      .fetch()
    // deleta os items que o usuário não quer mais
    await this.model
      .items()
      .whereNotIn(
        'id',
        items.map(item => item.id),
      )
      .delete(this.trx)

    // Atualiza os valores e quantidades
    await Promise.all(
      currentItems.rows.map(async item => {
        item.fill(items.find(n => n.id === item.id))
        await item.save(this.trx)
      }),
    )
  }

  async canApplyDiscount(coupon) {
    // verifica validade por data
    const now = new Date().getTime()
    if (
      now > coupon.valid_from.getTime() ||
      (typeof coupon.valid_until === 'object' &&
        coupon.valid_until.getTime() < now)
    ) {
      // verifica se o coupom já entrou em validade
      // verifica se entrou na data de expiração
      // se houver data de expiração, verifica se o cupom expirou
      return false
    }

    const couponProducts = await Database.from('coupon_products')
      .where('coupon_id', coupon.id)
      .pluck('product_id')

    const couponClients = await Database.from('coupon_user')
      .where('coupon_id', coupon.id)
      .pluck('user_id')

    // verifica se o cupom não está associado a produtos & clientes espcíficos
    if (
      Array.isArray(couponProducts) &&
      couponProducts.length < 1 &&
      Array.isArray(couponClients) &&
      couponClients.length < 1
    ) {
      /**
       *  Caso não esteja associado a cliente ou produto específico, é de uso livre
       */

      return true
    }

    let isAssociatedToProducts = false
    let isAssociatedToClients = false

    if (Array.isArray(couponProducts) && couponProducts.length > 0) {
      isAssociatedToProducts = true
    }

    if (Array.isArray(couponClients) && couponClients.length > 0) {
      isAssociatedToClients = true
    }

    const productsMatch = await Database.from('order_items')
      .where('order_id', this.model.id)
      .whereIn('product_id', couponProducts)
      .pluck('product_id')

    /**
     *  Caso de uso 1) O cupom está associado a clientes & produtos
     */
    if (isAssociatedToClients && isAssociatedToProducts) {
      const clientMatch = couponClients.find(
        client => client === this.model.user_id,
      )

      if (
        clientMatch &&
        Array.isArray(productsMatch) &&
        productsMatch.length > 0
      ) {
        return true
      }
    }

    /**
     *  Caso de uso 2) O cupom está associado apenas a produto
     */
    if (
      isAssociatedToProducts &&
      Array.isArray(productsMatch) &&
      productsMatch.length > 0
    ) {
      return true
    }

    /**
     *  Caso de uso 3) O cupom está associado a 1 ou mais clientes e nenhum produto
     */
    if (
      isAssociatedToClients &&
      Array.isArray(couponClients) &&
      couponClients.length > 0
    ) {
      const match = couponClients.find(client => client === this.model.user_id)
      if (match) {
        return true
      }
    }

    /**
     *  Caso nenhuma das verificações acima deem positivas então o cupom está
     * associado a clientes ou produtos ou os dois porém nenhuma dos produtos deste
     * está elegível ao desconto e o cliente que fez a compra também não poderá
     * utilizar este cupom
     */

    return false
  }
}

module.exports = OrderService
