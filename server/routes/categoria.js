'use strict';

const express = require('express');
const app = express();
const db = require('./../../models/index');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { verificaToken, verificaAmin_Role } = require('../middlewares/autenticacion');
const Categoria = db.Categoria;
const Usuario = db.Usuario;

// ===================================================
// Obtener todos las categorías
// ===================================================
app.get('/', async (req, res) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);

  let limite = req.query.limite || 5;
  limite = Number(limite);

  await Categoria.findAndCountAll({
    attributes: ['id', 'descripcion', 'estado'],
    where: { estado: true },
    offset: desde,
    limit: limite,
    include: [{
      model: Usuario,
      as: 'usuario',
      attributes: ['id', 'nombres', 'apepaterno', 'apematerno', 'email', 'role', 'estado'],
      where: {
        estado: true
      }
    }]
  }).then(categoriasDB => {
    if (!categoriaDB) {
      return res.json({
        ok: false,
        mensaje: 'No existen categorías.'
      });
    }
    return res.json({
      ok: true,
      categorias: categoriasDB.rows,
      total: categoriasDB.count
    });
  }).catch(e => {
    return {
      ok: false,
      error: e
    }
  })
});

// ===================================================
// Obtener categoria por ID
// ===================================================
app.get('/:id', async (req, res) => {
  let id = req.params.id;

  if (isNaN(id)) {
    return res.status(400).json({
      ok: false,
      error: { mensaje: `El id ingresado no es legible.` }
    });
  }

  await Categoria.findOne({
    attributes: ['id', 'descripcion', 'estado'],
    where: { id: id, estado: true },
    include: [{
      model: Usuario,
      as: 'usuario',
      attributes: ['id', 'nombres', 'apepaterno', 'apematerno', 'email', 'role', 'estado'],
      where: {
        estado: true
      }
    }]
  }).then(categoriaDB => {
    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        mensaje: `La categoría con el id ${id} no existe.`
      });
    }
    return res.json({
      ok: true,
      categoria: categoriaDB
    });
  }).catch(e => {
    return res.status(500).json({
      ok: false,
      mensaje: 'Error al encontrar categoría.',
      error: e
    })
  })
});


// ===================================================
// Buscar categoría por un término
// ===================================================
app.get('/buscar/:termino', [verificaToken], (req, res) => {
  let termino = req.params.termino;

  let desde = req.query.desde || 0;
  desde = Number(desde);

  let limite = req.query.limite || 5;
  limite = Number(limite);

  Categoria.findAndCountAll({
    attributes: ['id', 'descripcion', 'estado'],
    offset: desde,
    limit: limite,
    where: {
      estado: true,
      descripcion: {
        [Op.like]: '%' + termino.trim() + '%'
      }
    },
    include: [{
      model: Usuario,
      as: 'usuario',
      attributes: ['id', 'nombres', 'apepaterno', 'apematerno', 'email', 'role', 'estado'],
      where: {
        estado: true
      }
    }]
  }).then(categoriasDB => {
    if (!categoriasDB) {
      return res.status(400).json({
        ok: false,
        mensaje: `No hay categorías con el término brindado.`
      });
    }
    return res.json({
      ok: true,
      categorias: categoriasDB.rows,
      total: categoriasDB.count
    });
  }).catch(e => {
    return res.status(500).json({
      ok: false,
      mensaje: 'Error al encontrar categoría.',
      error: e
    })
  })
});


// ===================================================
// Crear una categoría
// ===================================================
app.post('/', [verificaToken], async (req, res) => {
  let body = req.body;

  await Categoria.findOne({
    attributes: ['id', 'descripcion', 'estado'],
    where: { descripcion: body.descripcion.trim(), estado: true }
  })
    .then(categoriaDB => {
      if (categoriaDB) {
        return res.status(400).json({
          ok: false,
          mensaje: `La categoría ${categoriaDB.descripcion} ya existe.`
        });
      } else {
        let categoria = Categoria.build({
          descripcion: body.descripcion,
          usuarioId: req.usuario.id
        });

        categoria.save()
          .then((categoriaGuardada) => {
            return res.json({
              ok: true,
              categoria: categoriaGuardada
            });
          })
          .catch(e => {
            return res.status(500).json({
              ok: false,
              mensaje: 'Error al guardar categoría.',
              error: e
            });
          })
      }
    })
    .catch(e => {
      console.log(e);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al encontrar categoría.',
        error: e
      });
    })
});



// ===================================================
// Actualizar categoría por ID
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

  await Categoria.findOne({
    attributes: ['id', 'descripcion', 'estado'],
    where: { id: id, estado: true }
  })
    .then(categoriaDB => {
      if (!categoriaDB) {
        return res.status(400).json({
          ok: false,
          mensaje: `La categoría con el id ${id} no existe.`
        })
      } else {
        categoriaDB.descripcion = body.descripcion;

        categoriaDB.save()
          .then(categoriaActualizada => {
            return res.json({
              ok: true,
              categoria: categoriaActualizada
            });
          })
          .catch(e => {
            return res.status(400).json({
              ok: false,
              mensaje: 'Error al actualizar categoría.',
              error: e
            });
          });
      }

    })
    .catch(e => {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al encontrar categoría.',
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

  await Categoria.findOne({
    attributes: ['id', 'descripcion', 'estado'],
    where: { id: id, estado: true }
  })
    .then(categoriaDB => {
      if (!categoriaDB) {
        return res.status(400).json({
          ok: false,
          mensaje: `La categoría con el id ${id} no existe.`
        })
      } else {
        categoriaDB.estado = false;

        categoriaDB.save()
          .then(categoriaBorrada => {
            return res.json({
              ok: true,
              categoria: categoriaBorrada
            });
          })
          .catch(e => {
            return res.status(400).json({
              ok: false,
              mensaje: 'Error al borrar categoría.',
              error: e
            });
          });
      }

    })
    .catch(e => {
      console.log(err);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al encontrar categoría.',
        error: e
      })
    })
});


module.exports = {
  app
}