"use strict";

const User = require("./user.model");
const httpStatus = require('http-status');
const APIResponse = require('../../helpers/APIResponse');
const Utils = require('../../helpers/utils')
let JWTHelper = require('../../helpers/jwt.helper');

class UserController {

    //sign up user
    async signUp(req, res, next) {
        try {
            const userExists = await User.findOne({ email: req.body.email });


            let model = new User(req.body);
            if (!userExists) {
                let response = await model.save();

                JWTHelper = require('../../helpers/jwt.helper');

                const token = JWTHelper.getJWTToken({
                    id: response.id,
                    email: response.email,
                    role: response.role,
                });

                response = {
                    ...JSON.parse(JSON.stringify(response)),
                    token: token
                }

                return res.status(httpStatus.OK).json(new APIResponse(response, 'User added successfully', httpStatus.OK));
            } else {
                return res.status(httpStatus.BAD_REQUEST).json(new APIResponse({}, 'User already exist', httpStatus.BAD_REQUEST));
            }
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse({}, 'Error adding user', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //login user
    async login(req, res, next) {
        let body = req.body;

        const user = await User.findOne({ $or: [{ email: req.body.email }] });
        const encryptPWD = Utils.encrypt(req.body.password);

        try {
            let response = await User.login(body.email, body.password);
            if (response) {
                JWTHelper = require('../../helpers/jwt.helper');

                const token = JWTHelper.getJWTToken({
                    id: response.id,
                    email: response.email,
                    department: response.department,
                    type: 'user'
                });

                response = {
                    ...JSON.parse(JSON.stringify(response)),
                    token: token
                }

                return res.status(httpStatus.OK).json(new APIResponse(response, 'Login successfully', httpStatus.OK));
            }
            return res.status(httpStatus.UNAUTHORIZED).json(new APIResponse({}, 'Authentication error', httpStatus.UNAUTHORIZED));

        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse({}, 'Error authenticating user', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //user get by id
    async getById(req, res, next) {
        let id = req.params.id;

        try {
            let response = await User.findById(id);
            if (response) {
                return res.status(httpStatus.OK).json(new APIResponse(response, 'User fetched successfully', httpStatus.OK));
            }
            return res.status(httpStatus.BAD_REQUEST).json(new APIResponse({}, 'User with the specified ID does not exists', httpStatus.BAD_REQUEST));

        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse(null, 'Error getting user', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //get all user
    async getAll(req, res, next) {
        try {
            console.log("=======", req.user);

            let response = await User.getAll();
            return res.status(httpStatus.OK)
                .json(new APIResponse(response, 'Users fetched successfully', httpStatus.OK));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse({}, 'Error getting users', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //update user 
    async update(req, res, next) {
        // try {

            delete req.body.email;
            // delete body.password;
            if (req.user.role == "admin" || req.user.id == req.body._id) {
                const response = await User.update(req.body);
                if (response) {
                    return res.status(httpStatus.OK).json(new APIResponse(response, 'User updated successfully', httpStatus.OK));
                }
                return res.status(httpStatus.BAD_REQUEST).json(new APIResponse({}, 'User with the specified ID does not exists', httpStatus.BAD_REQUEST));
            }
            return res.status(httpStatus.BAD_REQUEST).json(new APIResponse({}, 'you are not authorize to update this profile', httpStatus.BAD_REQUEST));
        // } catch (e) {
        //     return res.status(httpStatus.INTERNAL_SERVER_ERROR)
        //         .json(new APIResponse(null, 'Error updating user', httpStatus.INTERNAL_SERVER_ERROR, e));
        // }
    }

    //delete user by id
    async delete(req, res, next) {
        let userId = req.params.id;
        try {
            let response = await User.delete(userId);
            if (response) {
                return res.status(httpStatus.OK).json(new APIResponse({}, 'User deleted successfully', httpStatus.OK));
            }
            return res.status(httpStatus.BAD_REQUEST).json(new APIResponse({}, 'User with the specified ID does not exists', httpStatus.BAD_REQUEST));

        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse(null, 'Error deleting user', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }
}

var exports = (module.exports = new UserController());