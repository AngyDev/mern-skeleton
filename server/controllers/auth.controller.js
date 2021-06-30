import User from '../models/user.model';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import config from '../../config/config';

/**
 * Sign in methods checks the user from the email field and then checks the password with the authenticate methods of the UserSchema
 * If the pwd is successfully verified the JWT module is used to generate a JWT signed using a secret key and the user's _id value.
 * @param {Request} req 
 * @param {Response} res 
 * @returns A json with token and user information
 * Then, the signed JWT is returned to the authenticated client along with user details. Optionally, we can also set the token to a 
 * cookie in the response object so it is available to the client side if cookies is the chosen form of JWT storage. On the client side, 
 * this token must be attached as an Authorization header when requesting protected routes from the server.
 */
const signin = async (req, res) => {
    try {
        let user = await User.findOne({
            "email": req.body.email
        });
        if (!user)
            return res.status('401').json({
                error: "User not found"
            });

        if (!user.authenticate(req.body.password)) {
            return res.status('401').send({
                error: "Email and password don't match."
            });
        }

        const token = jwt.sign({
            _id: user._id
        }, config.jwtSecret);

        res.cookie("t", token, {
            expire: new Date() + 9999
        });

        return res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {

        return res.status('401').json({
            error: "Could not sign in"
        });
    }
}

/**
 * SignOut, cleat the cookie if the token is saved in the cookie, but this is a client responsability
 * @param {Request} req 
 * @param {Response} res 
 * @returns A json message of signed out
 */
const signout = (req, res) => {
    res.clearCookie("t");
    return res.status('200').json({
        message: "signed out"
    });
}

// To protect access to the read, update, and delete routes, the server will need to check that the requesting 
// client is actually an authenticated and authorized user.
// To check if the requesting user is signed in and has a valid JWT when a protected route is accessed, we will use the express-jwt module.

/**
 * Checks if the incoming request has a valid JWT token in the Authorization header
 * If the token is valid, it appends the verified user's ID in an 'auth' key to the request object, otherwise it throws an authentication error.
 */
const requireSignin = expressJwt({
    secret: config.jwtSecret,
    userProperty: 'auth',
    algorithms: ['HS256']
});

/**
 * Checks if the authenticated user is the same as the user being updated or deleted before the 
 * corresponding CRUD controller function is allowed to proceed.
 * @param {Request} req 
 * @param {Response} res 
 * Req.auth object is populated by express-jwt in requireSignin after authentication verification
 * and the req.profile is populated by the userByID function in the user.controller.js
 */
const hasAuthorization = (req, res, next) => {
    const authorized = req.profile && req.auth && req.profile._id == req.auth._id
    if (!(authorized)) {
        return res.status('403').json({
            error: "User is not authorized"
        });
    }
    next();
}

export default { signin, signout, requireSignin, hasAuthorization }