'use strict';

const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Usuarios', [{
            nombres: 'CARLOS ALBERTO',
            apepaterno: 'BLANCO',
            apeMaterno: 'VASQUEZ',
            password: bcrypt.hashSync('123456', salt),
            email: 'carlos@test.com',
            role: "ADMIN_ROLE",
            createdAt: new Date(),
            updatedAt: new Date()
        }], {});
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Usuarios', null, {});
    }
};