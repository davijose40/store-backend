'use strict'

class Login {
  get rules() {
    return {
      // validation rules
      email: 'required|emai',
      password: 'required',
    }
  }
}

module.exports = Login
