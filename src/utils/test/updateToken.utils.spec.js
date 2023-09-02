const jwt = require('jsonwebtoken');
const { User } = require('../../models/users.model');
const { Admin } = require('../../models/admins.model');
const authUtil = require('../updateToken.utils');

// Mock the required dependencies
jest.mock('jsonwebtoken');
jest.mock('../../models/users.model');
jest.mock('../../models/admins.model');

describe('Authentication Utility', () => {
    describe('generateAccessToken', () => {
        it('should generate an access token for the user', async () => {
            const user = { id: 123, email: 'test@example.com' };
            const accessToken = 'generated-access-token';

            jwt.sign.mockReturnValue(accessToken);

            const result = await authUtil.generateAccessToken(user);

            expect(jwt.sign).toHaveBeenCalledWith(user, process.env.ACCESS_TOKEN, {
                expiresIn: '1d',
            });
            expect(result).toBe(accessToken);
        });
    });

    describe('generateRefreshToken', () => {
        it('should generate a refresh token for the user', async () => {
            const user = { id: 123, email: 'test@example.com' };
            const refreshToken = 'generated-refresh-token';

            jwt.sign.mockReturnValue(refreshToken);

            const result = await authUtil.generateRefreshToken(user);

            expect(jwt.sign).toHaveBeenCalledWith(user, process.env.REFRESH_TOKEN);
            expect(result).toBe(refreshToken);
        });
    });

    describe('updateToken', () => {
        it('should update the refresh token for the user', async () => {
            const email = 'test@example.com';
            const token = 'refresh-token';

            const updatedUser = { email, refreshTokenHash: token };
            User.findOneAndUpdate.mockResolvedValue(updatedUser);

            const result = await authUtil.updateToken(email, token);

            expect(User.findOneAndUpdate).toHaveBeenCalledWith(
                { email: email },
                { refreshTokenHash: token },
                { new: true }
            );
            expect(result).toBe(updatedUser);
        });
    });

    describe('verifyToken', () => {
        it('should verify and decode the access token', async () => {
            const token = 'access-token';
            const decoded = { email: 'test@example.com' };
            const user = { email: 'test@example.com' };
            const req = { headers: { authorization: token }, user: null };
            const res = { status: jest.fn(), json: jest.fn() };
            const next = jest.fn();

            jwt.verify.mockImplementationOnce((_, __, callback) => {
                callback(null, decoded);
            });
            User.findOne.mockResolvedValue(user);

            await authUtil.verifyToken(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(
                token,
                process.env.ACCESS_TOKEN,
                expect.any(Function)
            );
            expect(User.findOne).toHaveBeenCalledWith({ email: decoded.email });
            expect(req.user).toBe(user);
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        // it('should handle verification errors and send a response', async () => {
        //     const token = 'access-token';
        //     const error = new Error('Token verification failed');
        //     const req = { headers: { authorization: token }, user: null };
        //     const res = { status: jest.fn(), json: jest.fn() };
        //     const next = jest.fn();

        //     jwt.verify.mockImplementationOnce((_, __, callback) => {
        //         callback(error, null);
        //     });

        //     await authUtil.verifyToken(req, res, next);

        //     expect(jwt.verify).toHaveBeenCalledWith(
        //         token,
        //         process.env.ACCESS_TOKEN,
        //         expect.any(Function)
        //     );
        //     expect(User.findOne).not.toHaveBeenCalled();
        //     expect(req.user).toBeNull();
        //     expect(next).not.toHaveBeenCalled();
        //     expect(res.status).toHaveBeenCalledWith(500);
        //     expect(res.json).toHaveBeenCalledWith({ message: 'Please login again' });
        // });

        //it('should handle user not found and send a response', async () => {
            //const token = 'access-token';
            //const decoded = { email: 'test@example.com' };
            //const req = { headers: { authorization: token }, user: null };
            //const res = { status: jest.fn(), json: jest.fn() };
            //const next = jest.fn();

            //jwt.verify.mockImplementationOnce((_, __, callback) => {
                //callback(null, decoded);
            //});
            //User.findOne.mockResolvedValue(null);

            //await authUtil.verifyToken(req, res, next);

            //expect(jwt.verify).toHaveBeenCalledWith(
                //token,
                //process.env.ACCESS_TOKEN,
                //expect.any(Function)
            //);
            //expect(User.findOne).toHaveBeenCalledWith({ email: decoded.email });
            //expect(req.user).toBeNull();
            //expect(next).not.toHaveBeenCalled();
            //expect(res.status).toHaveBeenCalledWith(401);
            //expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        //});
    });

    describe('verifyTokenAdmin', () => {
        it('should verify and decode the admin token', async () => {
            const token = 'admin-token';
            const decoded = { _id: 'admin-id' };
            const admin = { _id: 'admin-id' };
            const req = { headers: { authorization: token }, admin: null };
            const res = { status: jest.fn(), json: jest.fn() };
            const next = jest.fn();

            jwt.verify.mockImplementationOnce((_, __, callback) => {
                callback(null, decoded);
            });
            Admin.findById.mockResolvedValue(admin);

            await authUtil.verifyTokenAdmin(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith(
                token,
                process.env.TOKEN_KEY_ADMIN,
                expect.any(Function)
            );
            expect(Admin.findById).toHaveBeenCalledWith(decoded._id);
            expect(req.admin).toBe(admin);
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        // it('should handle verification errors and send a response', async () => {
        //     const token = 'admin-token';
        //     const error = new Error('Token verification failed');
        //     const req = { headers: { authorization: token }, admin: null };
        //     const res = { status: jest.fn(), json: jest.fn() };
        //     const next = jest.fn();

        //     jwt.verify.mockImplementationOnce((_, __, callback) => {
        //         callback(error, null);
        //     });

        //     await authUtil.verifyTokenAdmin(req, res, next);

        //     expect(jwt.verify).toHaveBeenCalledWith(
        //         token,
        //         process.env.TOKEN_KEY_ADMIN,
        //         expect.any(Function)
        //     );
        //     expect(Admin.findById).not.toHaveBeenCalled();
        //     expect(req.admin).toBeNull();
        //     expect(next).not.toHaveBeenCalled();
        //     expect(res.status).toHaveBeenCalledWith(500);
        //     expect(res.json).toHaveBeenCalledWith({ message: 'Please login again' });
        // });

        // it('should handle admin not found and send a response', async () => {
        //     const token = 'admin-token';
        //     const decoded = { _id: 'admin-id' };
        //     const req = { headers: { authorization: token }, admin: null };
        //     const res = { status: jest.fn(), json: jest.fn() };
        //     const next = jest.fn();

        //     jwt.verify.mockImplementationOnce((_, __, callback) => {
        //         callback(null, decoded);
        //     });
        //     Admin.findById.mockResolvedValue(null);

        //     await authUtil.verifyTokenAdmin(req, res, next);

        //     expect(jwt.verify).toHaveBeenCalledWith(
        //         token,
        //         process.env.TOKEN_KEY_ADMIN,
        //         expect.any(Function)
        //     );
        //     expect(Admin.findById).toHaveBeenCalledWith(decoded._id);
        //     expect(req.admin).toBeNull();
        //     expect(next).not.toHaveBeenCalled();
        //     expect(res.status).toHaveBeenCalledWith(401);
        //     expect(res.json).toHaveBeenCalledWith({
        //         message: 'You are not allowed to perform this action!',
        //     });
        // });
    });

    describe('updateTokenAdmin', () => {
        it('should update the admin token', async () => {
            const adminId = 'admin-id';
            const token = 'new-token';
            const updatedAdmin = { _id: adminId, token: token };

            Admin.findByIdAndUpdate.mockResolvedValue(updatedAdmin);

            const result = await authUtil.updateTokenAdmin(adminId, token);

            expect(Admin.findByIdAndUpdate).toHaveBeenCalledWith(
                adminId,
                { token: token },
                { new: true }
            );
            expect(result).toBe(updatedAdmin);
        });
    });
});
