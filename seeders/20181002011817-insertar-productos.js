'use strict';

let registros = 50;
var productosArray = [];
var usuarioID = [];
var categoriaID = [];
var precios = [];


for (let i = 1; i <= 10; ++i) categoriaID.push(i);
for (let i = 1; i <= 20; ++i) usuarioID.push(i);

for (let i = 1; i <= 30; i++) precios.push((Math.random() * 30 + 1).toFixed(2));

for (let i = 1; i <= registros; i++) {
  let usuarioRAN = usuarioID[Math.floor(Math.random() * usuarioID.length)];
  let categoriaRAN = categoriaID[Math.floor(Math.random() * categoriaID.length)];
  let precioRAN = precios[Math.floor(Math.random() * precios.length)];
  let categoria = {
    nombre: 'PRODUCTO ' + [i],
    precioUni: precioRAN,
    descripcion: 'DESCRIPCION DEL PRODUCTO ' + [i],
    categoriaId: categoriaRAN,
    usuarioId: usuarioRAN,
    estado: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  productosArray.push(categoria);
}

// console.log(productosArray);
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Productos', productosArray, {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Productos', null, {});
  }
};
