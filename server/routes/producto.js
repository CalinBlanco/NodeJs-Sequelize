'use strict';

const express = require('express');
const app = express();
const db = require('./../../models/index');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { verificaToken, verificaAmin_Role } = require('../middlewares/autenticacion');
const Producto = db.Producto;
const Categoria = db.Categoria;
const Usuario = db.Usuario;

// ===================================================
// Obtener todos los productos
// ===================================================
app.get('/', async (req, res) => {

  let desde = req.query.desde || 0;
  desde = Number(desde);

  let limite = req.query.limite || 5;
  limite = Number(limite);

  await Producto.findAndCountAll({
    attributes: ['id', 'nombre', 'precioUni', 'descripcion', 'estado'],
    where: { estado: true },
    offset: desde,
    limit: limite,
    include: [{
      model: Categoria,
      as: 'categoria',
      attributes: ['id', 'descripcion', 'estado'],
      where: {
        estado: true
      }
    },
    {
      model: Usuario,
      attributes: ['id', 'nombres', 'apepaterno', 'apematerno', 'email', 'role', 'estado'],
      where: {
        estado: true
      }
    }]
  }).then(productosDB => {
    return res.json({
      ok: true,
      productos: productosDB.rows,
      total: productosDB.count
    });
  }).catch(e => {
    return res.status(500).json({
      ok: false,
      mensaje: 'Error al encontrar producto.',
      error: e
    })
  })
});

// ===================================================
// Obtener producto por ID
// ===================================================
app.get('/:id', async (req, res) => {
  let id = req.params.id;

  if (isNaN(id)) {
    return res.status(400).json({
      ok: false,
      error: { mensaje: `El id ingresado no es legible.` }
    });
  }

  await Producto.findOne({
    attributes: ['id', 'nombre', 'precioUni', 'descripcion', 'estado'],
    where: { id: id, estado: true },
    include: [{
      model: Categoria,
      as: 'categoria',
      attributes: ['id', 'descripcion', 'estado'],
      where: {
        estado: true
      }
    },
    {
      model: Usuario,
      attributes: ['id', 'nombres', 'apepaterno', 'apematerno', 'email', 'role', 'estado'],
      where: {
        estado: true
      }
    }]
  }).then(productoDB => {
    if (!productoDB) {
      return res.status(400).json({
        ok: false,
        mensaje: `El producto con el id ${id} no existe.`
      });
    }
    return res.json({
      ok: true,
      producto: productoDB
    });
  }).catch(e => {
    return res.status(500).json({
      ok: false,
      mensaje: 'Error al encontrar producto.',
      error: e
    })
  })
});


// ===================================================
// Buscar producto por un término
// ===================================================
app.get('/buscar/:termino', [verificaToken], (req, res) => {
  let termino = req.params.termino;

  let desde = req.query.desde || 0;
  desde = Number(desde);

  let limite = req.query.limite || 10;
  limite = Number(limite);

  Producto.findAndCountAll({
    attributes: ['id', 'nombre', 'precioUni', 'descripcion', 'estado'],
    offset: desde,
    limit: limite,
    where: {
      estado: true,
      [Op.or]: {
        nombre: {
          [Op.like]: '%' + termino.trim() + '%'
        },
        descripcion: {
          [Op.like]: '%' + termino.trim() + '%'
        },

      }
    },
    include: [{
      model: Categoria,
      as: 'categoria',
      attributes: ['id', 'descripcion', 'estado'],
      where: {
        estado: true
      }
    },
    {
      model: Usuario,
      attributes: ['id', 'nombres', 'apepaterno', 'apematerno', 'email', 'role', 'estado'],
      where: {
        estado: true
      }
    }]
  }).then(productosDB => {
    if (!productosDB) {
      return res.status(400).json({
        ok: false,
        mensaje: `No hay productos con el término brindado.`
      });
    }
    return res.json({
      ok: true,
      productos: productosDB.rows,
      total: productosDB.count
    });
  }).catch(e => {
    return res.status(500).json({
      ok: false,
      mensaje: 'Error al encontrar productos.',
      error: e
    })
  })
});

// ===================================================
// Crear un producto
// ===================================================
app.post('/', [verificaToken], async (req, res) => {
  let body = req.body;

  await Producto.findOne({
    attributes: ['id', 'nombre', 'precioUni', 'descripcion', 'estado'],
    where: { nombre: body.nombre.trim(), estado: true }
  })
    .then(productoDB => {
      if (productoDB) {
        return res.status(400).json({
          ok: false,
          mensaje: `El producto ${productoDB.nombre} ya existe.`
        });
      } else {
        let producto = Producto.build({
          nombre: body.nombre,
          precioUni: body.precioUni,
          descripcion: body.descripcion,
          categoriaId: body.categoriaId,
          usuarioId: req.usuario.id
        });

        producto.save()
          .then((productoGuardado) => {
            return res.json({
              ok: true,
              producto: productoGuardado
            });
          })
          .catch(e => {
            return res.status(500).json({
              ok: false,
              mensaje: 'Error al guardar producto.',
              error: e
            });
          })
      }
    })
    .catch(e => {
      console.log(e);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al encontrar producto.',
        error: e
      });
    })
});



// ===================================================
// Actualizar producto por ID
// ===================================================
app.put('/:id', [verificaToken, verificaAmin_Role], async (req, res) => {
  let id = Number(req.params.id);
  let body = req.body;

  if (isNaN(id)) {
    return res.status(400).json({
      ok: false,
      error: { mensaje: `El id ingresado no es legible.` }
    });
  }

  await Producto.findOne({
    attributes: ['id', 'nombre', 'precioUni', 'descripcion', 'categoriaId', 'estado'],
    where: { id: id, estado: true }
  })
    .then(productoDB => {
      if (!productoDB) {
        return res.status(400).json({
          ok: false,
          mensaje: `El producto con el id ${id} no existe.`
        })
      } else {

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.descripcion = body.descripcion;
        productoDB.categoriaId = body.categoriaId;

        productoDB.save()
          .then(productoActualizado => {
            return res.json({
              ok: true,
              producto: productoActualizado
            });
          })
          .catch(e => {
            return res.status(400).json({
              ok: false,
              mensaje: 'Error al actualizar producto.',
              error: e
            });
          });
      }

    })
    .catch(e => {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al encontrar producto.',
        error: e
      })
    })

});

// ===================================================
// Borrar una categoría por su ID
// ===================================================
app.delete('/:id', [verificaToken, verificaAmin_Role], async (req, res) => {
  let id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      ok: false,
      error: { mensaje: `El id ingresado no es legible.` }
    });
  }

  await Producto.findOne({
    attributes: ['id', 'nombre', 'precioUni', 'descripcion', 'categoriaId', 'estado'],
    where: { id: id, estado: true }
  })
    .then(productoDB => {
      if (!productoDB) {
        return res.status(400).json({
          ok: false,
          mensaje: `El producto con el id ${id} no existe.`
        })
      } else {
        productoDB.estado = false;

        productoDB.save()
          .then(productoBorrado => {
            return res.json({
              ok: true,
              producto: productoBorrado
            });
          })
          .catch(e => {
            return res.status(400).json({
              ok: false,
              mensaje: 'Error al borrar producto.',
              error: e
            });
          });
      }

    })
    .catch(e => {
      console.log(err);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al encontrar producto.',
        error: e
      })
    })
});


module.exports = {
  app
}