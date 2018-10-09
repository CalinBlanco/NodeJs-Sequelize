'use strict';

const express = require('express');
const app = express();
const db = require('./../../models/index');

const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const emailValidator = require("email-validator");

const { verificaToken, verificaAmin_Role } = require('../middlewares/autenticacion');
const Usuario = db.Usuario;

// ===================================================
// Obtener todos los usuarios
// ===================================================
app.get('/', async (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    await Usuario.findAndCountAll({
        attributes: ['id', 'nombres', 'apepaterno', 'apematerno', 'email', 'role', 'estado'],
        where: { estado: true },
        offset: desde,
        limit: limite
    }).then(usuariosDB => {
        return res.json({
            ok: true,
            usuarios: usuariosDB.rows,
            total: usuariosDB.count
        });
    }).catch(e => {
        return {
            ok: false,
            error: e
        }
    })
});

// ===================================================
// Obtener usuario por ID
// ===================================================
app.get('/:id', async (req, res) => {
    let id = req.params.id;

    if (isNaN(id)) {
        return res.status(400).json({
            ok: false,
            error: { mensaje: `El id ingresado no es legible.` }
        });
    }

    await Usuario.findOne({
        attributes: ['id', 'nombres', 'apepaterno', 'apematerno', 'email', 'role', 'estado'],
        where: { id: id, estado: true }
    }).then(usuarioDB => {
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario con el id ${id} no existe.`
            });
        }
        return res.json({
            ok: false,
            usuario: usuarioDB
        });
    }).catch(e => {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al encontrar usuario.',
            error: e
        })
    })
});


// ===================================================
// Crear un usuario
// ===================================================
app.post('/', [verificaToken, verificaAmin_Role], async (req, res) => {
    let body = req.body;
    let email = req.body.email;

    if (!email) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Se necesita el campo email.'
        });
    }

    if (!emailValidator.validate(email.trim())) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El email no es válido.'
        });
    }


    await Usuario.findOne({
        attributes: ['id', 'nombres', 'apepaterno', 'apematerno', 'email', 'role', 'estado'],
        where: { email: email, estado: true }
    })
        .then(usuarioEncontrado => {
            if (usuarioEncontrado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `El email ${usuarioEncontrado.email} ya esta siendo usado por otro usuario.`
                });
            } else {

                let usuario = Usuario.build({
                    nombres: body.nombres,
                    apepaterno: body.apepaterno,
                    apematerno: body.apematerno,
                    password: bcrypt.hashSync(body.password, salt),
                    email: body.email
                });

                usuario.save()
                    .then((usuarioActualizado) => {
                        return res.json({
                            ok: true,
                            usuario: usuarioActualizado
                        });
                    })
                    .catch(e => {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al guardar usuario.',
                            error: e
                        });
                    })
            }
        })
        .catch(e => {
            console.log(e);
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar usuario.',
                error: e
            });
        })
});



// ===================================================
// Actualizar usuario por ID
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

    await Usuario.findOne({
        attributes: ['id', 'nombres', 'apepaterno', 'apematerno', 'role'],
        where: { id: id, estado: true }
    })
        .then(usuarioEncontrado => {
            if (!usuarioEncontrado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `El usuario con el id ${id} no existe.`
                })
            } else {
                usuarioEncontrado.nombres = body.nombres;
                usuarioEncontrado.apepaterno = body.apepaterno;
                usuarioEncontrado.apematerno = body.apematerno;
                usuarioEncontrado.role = body.role;

                usuarioEncontrado.save()
                    .then(usuarioActualizado => {
                        return res.json({
                            ok: true,
                            usuario: usuarioActualizado
                        });
                    })
                    .catch(e => {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al actualizar usuario.',
                            error: e
                        });
                    });
            }

        })
        .catch(e => {
            console.log(err);
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar usuario.',
                error: e
            })
        })

});

// ===================================================
// Borrar un usuario por su ID
// ===================================================
app.delete('/:id', [verificaToken, verificaAmin_Role], async (req, res) => {
    let id = Number(req.params.id);

    await Usuario.findOne({
        attributes: ['id', 'nombres', 'apepaterno', 'apematerno', 'estado'],
        where: { id: id }
    })
        .then(usuarioEncontrado => {
            if (!usuarioEncontrado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `El usuario con el id ${id} no existe.`
                })
            }
            usuarioEncontrado.estado = false;

            usuarioEncontrado.save()
                .then(usuarioActualizado => {
                    return res.json({
                        ok: true,
                        usuario: usuarioActualizado
                    });
                })
                .catch(e => {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al borrar usuario.',
                        error: e
                    });
                });

        })
        .catch(e => {
            console.log(err);
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al encontrar usuario.',
                error: e
            })
        })
});


module.exports = {
    app
}