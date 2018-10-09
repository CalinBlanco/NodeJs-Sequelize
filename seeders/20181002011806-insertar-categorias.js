'use strict';

let registros = 10;
var categoriasArray = [];
var usuarioID = [];

for (let i = 1; i <= 20; ++i) usuarioID.push(i);

for (let i = 1; i <= registros; i++) {
  let randomID = usuarioID[Math.floor(Math.random() * usuarioID.length)];
  let categoria = {
    descripcion: 'CATEGORIA ' + [i],
    usuarioId: randomID,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  // categoriasArray[i] = categoria;
  categoriasArray.push(categoria);
}

// console.log(categoriasArray);
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Categorias', categoriasArray, {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Categorias', null, {});
  }
};
