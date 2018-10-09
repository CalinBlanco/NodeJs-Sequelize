'use strict';
module.exports = (sequelize, DataTypes) => {
  const Producto = sequelize.define('Producto', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      set(val) {
        this.setDataValue('nombre', val.toUpperCase());
      }
    },
    precioUni: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
      set(val) {
        this.setDataValue('descripcion', val.toUpperCase());
      }
    },
    img: {
      type: DataTypes.STRING,
      allowNull: true
    },
    categoriaId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {});
  Producto.associate = function (models) {
    Producto.belongsTo(models.Usuario, { foreignKey: 'usuarioId' });
    Producto.belongsTo(models.Categoria, { as: 'categoria', foreignKey: 'CategoriaId' });
  };
  return Producto;
};