'use strict'

class AuthRegister {
  get rules() {
    return {
      // validation rules
      name: 'required',
      surname: 'required',
      email: 'required|email|unique:users,email',
      password: 'required|confirmed',
    }
  }

  get messages() {
    return {
      'name.required': 'O nome é obrigatório.',
      'surname.required': 'O sobrenome é obrigatório.',
      'email.required': 'O Email é obrigatório.',
      'email.email': 'Email inválido.',
      'email.unique': 'Este Email já exite.',
      'password.required': 'A senha é obrigatória.',
      'password.confirmed': 'As senhas não são iguais.',
    }
  }
}

module.exports = AuthRegister
