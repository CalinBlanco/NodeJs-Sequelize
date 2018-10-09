'use strict';
module.exports = (sequelize, DataTypes) => {
  const Categoria = sequelize.define('Categoria', {
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false,
      set(val) {
        this.setDataValue('descripcion', val.toUpperCase());
      }
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
      tableName: 'categorias',
    });
  Categoria.associate = function (models) {
    Categoria.belongsTo(models.Usuario, { as: 'usuario', fereignKey: 'usuarioId' });
    Categoria.hasMany(models.Producto, { foreignKey: 'categoriaId' });
  };
  return Categoria;
};