import User from '../models/user.model';
import _ from 'lodash';
import errorHandler from '../helpers/dbErrorHandler';

/**
 * Create a user
 * @param {Request} req 
 * @param {Response} res 
 * @param {Next} next 
 */
const create = (req, res, next) => {
    const user = new User(req.body);
    user.save((err, result) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler.getErrorMessage(err)
            });
        }
        res.status(200).json({
            message: "Successfully signed up!"
        });
    })
}

/**
 * Gets the users list
 * @param {Request} req 
 * @param {Response} res 
 * @return Array the list of users
 */
const list = (req, res) => {
    User.find((err, users) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler.getErrorMessage(err)
            });
        }
        res.json(users)
    }).select('name email updated created');
}

/**
 * Get the user by ID
 * @param {Request} req 
 * @param {Response} res 
 * @param {Next} next 
 * @param {Number} id 
 */
const userByID = (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
        if (err || !user) {
            return res.status('400').json({
                error: "User not found"
            })
        }
        req.profile = user;
        // Is used to propagated control to the next relevant controller function
        next();
    })
}

/**
 * Reads user information without return password one
 * @param {Request} req 
 * @param {Response} res 
 * @returns user profile
 */
const read = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
}

/**
 * Updates the user information
 * @param {Request} req 
 * @param {Response} res 
 * @param {Next} next 
 */
const update = (req, res, next) => {
    let user = req.profile;
    // uses the lodash module to extend and merge the changed that came in the request body to update the user data
    user = _.extend(user, req.body);
    user.updated = Date.now();
    user.save((err) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler.getErrorMessage(err)
            });
        }
        user.hashed_password = undefined;
        user.salt = undefined;
        res.json(user);
    });
}

/**
 * Removes the user
 * @param {Request} req 
 * @param {Response} res 
 * @param {Next} next 
 */
const remove = (req, res, next) => {
    let user = req.profile;
    user.remove((err, deletedUser) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler.getErrorMessage(err)
            });
        }
        deletedUser.hashed_password = undefined;
        deletedUser.salt = undefined;
        res.json(deletedUser);
    })
}

export default { create, userByID, read, list, remove, update }