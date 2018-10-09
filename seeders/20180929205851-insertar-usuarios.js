'use strict';

const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

let registros = 20;
var usuariosArray = [];

for (let i = 2; i <= registros; i++) {
  const usuario = {
    nombres: 'TEST' + [i],
    apepaterno: 'TEST' + [i] + '_APEPATERNO',
    apeMaterno: 'TEST' + [i] + '_APEMATERNO',
    password: bcrypt.hashSync('123456', salt),
    email: 'test' + [i] + '@test.com',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  usuariosArray.push(usuario);
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Usuarios', usuariosArray, {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Usuarios', null, {});
  }
};
