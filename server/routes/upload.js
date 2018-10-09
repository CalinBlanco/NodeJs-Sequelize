const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const db = require('./../../models/index');

const Sequelize = require('sequelize');

const fs = require('fs');
const path = require('path');

const Producto = db.Producto;
const Usuario = db.Usuario;

// Este middleware coloca cualquier archivo enviado al objeto "req.file"
app.use(fileUpload());

app.put('/:tipo/:id', function (req, res) {
  let tipo = req.params.tipo;
  let id = req.params.id;

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      err: {
        mensaje: "No se ha seleccionado ningún archivo."
      }
    });
  }

  //Validar tipo
  let tiposValidos = ['productos', 'usuarios'];

  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        mensaje: `Los tipos permitidos son: ${tiposValidos.join(', ')}`
      }
    });
  }

  // Se asigna el valor del input "archivo" a la variable archivo
  let archivo = req.files.archivo;

  let nombreCortado = archivo.name.split('.');
  let extensionArchivo = nombreCortado[nombreCortado.length - 1];

  // Extensiones permitidas.
  let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        mensaje: `Las extensiones permitidas son: ${extensionesValidas.join(', ')}`,
        ext: extensionArchivo
      }
    });
  }

  // Cambiar nombre al archivo
  let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

  // Utilizamos el método mv() para mover el archivo a algún lugar del servidor.
  archivo.mv(`uploads/${tipo}/${nombreArchivo}`, err => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }

    // En este punto sabemos que la imagen ya esta cargada.

    if (tipo === 'usuarios') {
      imagenUsuario(id, res, nombreArchivo);
    } else if (tipo === 'productos') {
      imagenProducto(id, res, nombreArchivo);
    }
    else {
      borraArchivo(nombreArchivo, tipo);
      return res.status(400).json({
        ok: false,
        err: {
          mensaje: `Los tipos permitidos son: ${tiposValidos.join(', ')}`
        }
      });
    }
  });
});

function imagenUsuario(idNumber, res, nombreArchivo) {
  let id = Number(idNumber);
  if (isNaN(id)) {
    return res.status(400).json({
      ok: false,
      error: { mensaje: `El id ingresado no es reconocido como un id.` }
    });
  }

  Usuario.findOne({
    attributes: ['id', 'nombres', 'apepaterno', 'apematerno', 'img', 'role', 'estado'],
    where: { id: id, estado: true }
  })
    .then(usuarioEncontrado => {
      if (!usuarioEncontrado) {
        return res.status(400).json({
          ok: false,
          mensaje: `El usuario con el id ${id} no existe.`
        })
      }

      borraArchivo(usuarioEncontrado.img, 'usuarios');

      usuarioEncontrado.img = nombreArchivo;

      usuarioEncontrado.save()
        .then(usuarioActualizado => {
          return res.json({
            ok: true,
            usuario: usuarioActualizado,
            im: nombreArchivo
          });
        })
        .catch(e => {
          return res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar usuario.',
            error: e
          });
        });

    })
    .catch(e => {
      borraArchivo(nombreArchivo, 'usuarios');
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al encontrar usuario.',
        error: e
      })
    })
}

function imagenProducto(idNumber, res, nombreArchivo) {
  let id = Number(idNumber);
  if (isNaN(id)) {
    return res.status(400).json({
      ok: false,
      error: { mensaje: `El id ingresado no es reconocido como un id.` }
    });
  }

  Producto.findOne({
    attributes: ['id', 'nombre', 'precioUni', 'descripcion', 'img', 'categoriaId', 'estado'],
    where: { id: id, estado: true }
  })
    .then(productoEncontrado => {
      if (!productoEncontrado) {
        return res.status(400).json({
          ok: false,
          mensaje: `El producto con el id ${id} no existe.`
        })
      }

      borraArchivo(productoEncontrado.img, 'productos');

      productoEncontrado.img = nombreArchivo;

      productoEncontrado.save()
        .then(productoActualizado => {
          return res.json({
            ok: true,
            producto: productoActualizado,
            im: nombreArchivo
          });
        })
        .catch(e => {
          return res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar producto.',
            error: e
          });
        });

    })
    .catch(e => {
      borraArchivo(nombreArchivo, 'productos');
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al encontrar producto.',
        error: e
      })
    })
}


function borraArchivo(nombreImagen, tipo) {
  let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);

  if (fs.existsSync(pathImagen)) {
    fs.unlinkSync(pathImagen);
  }
}

module.exports = {
  app
}