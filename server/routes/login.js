const express = require('express');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('./../../models/index');
const Usuario = db.Usuario;

const app = express();

// ===================================================
// Login como usuario del sistema
// ===================================================
app.post('/', async (req, res) => {
    let body = req.body;
    let email = req.body.email;

    if (!email) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Se necesita el campo email.'
        });
    }

    await Usuario.findOne({
        // attributes: ['id', 'nombres', 'apepaterno', 'apematerno', 'email', 'role', 'estado'],
        where: { email: body.email, estado: true }
    })
        .then(usuarioDB => {
            if (!usuarioDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: '(Usuario) y/o Password incorrecto(s)'
                });
            }

            if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        mensaje: 'Usuario y/o (Password) incorrecto(s)'
                    }
                });
            }

            let token = jwt.sign({
                usuario: usuarioDB
            }, process.env.SEED, { expiresIn: process.env.EXPIRA_TOKEN });



            return res.json({
                ok: true,
                usuario: usuarioDB,
                token
            });
        })
        .catch(e => {
            console.log('Error:', e)
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