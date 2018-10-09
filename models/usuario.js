'use strict';

var sequelizeTransforms = require('sequelize-transforms');

module.exports = (sequelize, DataTypes) => {
    const Usuario = sequelize.define('Usuario', {
        nombres: {
            type: DataTypes.STRING,
            allowNull: false,
            trim: true,
            validate: {
                notEmpty: { msg: 'Por favor ingresa nombres' }
            },
            set(nombres) {
                this.setDataValue('nombres', nombres.toString().toUpperCase());
            }
        },
        apepaterno: {
            type: DataTypes.STRING,
            allowNull: false,
            trim: true,
            validate: {
                notEmpty: { msg: 'Por favor ingresa el apellido paterno' }
            },
            set(apepaterno) {
                this.setDataValue('apepaterno', apepaterno.toString().toUpperCase());
            }
        },
        apematerno: {
            type: DataTypes.STRING,
            allowNull: false,
            trim: true,
            validate: {
                notEmpty: { msg: 'Por favor ingresa el apellido materno' }
            },
            set(apematerno) {
                this.setDataValue('apematerno', apematerno.toString().toUpperCase());
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            trim: true,
            validate: {
                notEmpty: { msg: 'Por favor ingresa tu password' }
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                msg: 'Este email ya esta siendo usado por otro usuario.'
            },
            trim: true,
            validate: {
                isEmail: true,
                notEmpty: { msg: 'Por favor ingresa tu email' }
            },
            set(email) {
                this.setDataValue('email', email.toString().toLowerCase());
            }
        },
        img: {
            type: DataTypes.STRING,
            allowNull: true,
            trim: true,
        },
        role: {
            type: DataTypes.ENUM('ADMIN_ROLE', 'USER_ROLE'),
            defaultValue: "USER_ROLE"
        },
        estado: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        google: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    }, {
            tableName: 'usuarios',
            getterMethods: {
                nombreCompleto() {
                    return this.nombres + ' ' + this.apepaterno + ' ' + this.apematerno;
                }
            }
        }
    );
    Usuario.associate = function (models) {
        Usuario.hasMany(models.Categoria, { foreignKey: 'usuarioId' });
        Usuario.hasMany(models.Producto, { foreignKey: 'usuarioId' });
    };

    sequelizeTransforms(Usuario);

    Usuario.prototype.toJSON = function () {
        var campos = Object.assign({}, this.get());

        delete campos.password;
        delete campos.createdAt;
        delete campos.updatedAt;
        return campos;
    };

    return Usuario;
};