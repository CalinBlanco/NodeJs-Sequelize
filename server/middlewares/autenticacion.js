const jwt = require('jsonwebtoken');

// Verificar Token
let verificaToken = (req, res, next) => {
    let token = req.get('Authorization'); // Aquí obtenemos la varible que viene del Headers

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    mensaje: 'Token no válido.'
                }
            });
        }

        req.usuario = decoded.usuario;
        // console.log(decoded.exp - decoded.iat);
        next();
    });
    // res.json({
    //     token
    // });
};

// Verifica ADMIN_ROLE
let verificaAmin_Role = (req, res, next) => {
    let usuario = req.usuario;

    if (usuario.role !== 'ADMIN_ROLE') {
        return res.json({
            ok: false,
            err: {
                mensaje: 'EL usuario no es Adminitrador.'
            }
        });
    } else {
        next();
        return;
    }

};


// Verifica TOKEN para imagen
let verificaTokenImg = (req, res, next) => {
    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    mensaje: 'Token no válido.'
                }
            });
        }

        req.usuario = decoded.usuario;
        // console.log(decoded.exp - decoded.iat);
        next();
    });
};


module.exports = {
    verificaToken,
    verificaAmin_Role,
    verificaTokenImg
}