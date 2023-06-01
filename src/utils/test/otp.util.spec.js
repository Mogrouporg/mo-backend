const util = require('util');
const {addToRedis, getValueFromRedis, deleteFromRedis, genOtp} = require('../otp.util');
const redis = require('redis');

jest.mock('redis', () => {
  const redisClientMock = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  };

  return {
    createClient: jest.fn(() => redisClientMock),
    redisClientMock, // Exporting the mock for individual method mocking
  };
});

describe('OTP Util', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addToRedis', () => {
    it('should add value to Redis with the specified key and expiration', async () => {
      const key = 'test-key';
      const value = 'test-value';
      const expiresIn = 60;

      await addToRedis(key, value, expiresIn);

      expect(redis.createClient).toHaveBeenCalled();
      expect(redis.redisClientMock.set).toHaveBeenCalledWith(key, value, expiresIn);
    });

//     it('should handle errors when adding value to Redis', async () => {
//       const key = 'test-key';
//       const value = 'test-value';
//       const expiresIn = 60;

//       const error = new Error('Redis error');
//       redis.redisClientMock.set.mockImplementationOnce(util.promisify((_, __, ___, ____, callback) => {
//         callback(error);
//       }));

//       await expect(otpUtil.addToRedis(key, value, expiresIn)).rejects.toThrow(error);
//       expect(redis.redisClientMock.set).toHaveBeenCalledWith(key, value, 'EX', expiresIn);
//       expect(console.error).toHaveBeenCalledWith(error);
//     });
  });

  describe('getValueFromRedis', () => {
    it('should retrieve value from Redis for the specified key', async () => {
      const key = 'test-key';
      const value = 'test-value';

      redis.redisClientMock.get.mockImplementationOnce(util.promisify((_, callback) => {
        callback(null, value);
      }));

      const result = await getValueFromRedis(key);

      expect(redis.redisClientMock.get).toHaveBeenCalledWith(key);
      expect(result).toEqual(value);
    });

    // it('should handle errors when retrieving value from Redis', async () => {
    //   const key = 'test-key';

    //   const error = new Error('Redis error');
    //   redis.redisClientMock.get.mockImplementationOnce(util.promisify((_, callback) => {
    //     callback(error);
    //   }));

    //   await expect(otpUtil.getValueFromRedis(key)).rejects.toThrow(error);
    //   expect(redis.redisClientMock.get).toHaveBeenCalledWith(key);
    //   expect(console.error).toHaveBeenCalledWith(error);
    // });
  });

  describe('genOtp', () => {
    it('should generate a random 6-digit OTP', () => {
      const otp = genOtp();

      expect(otp).toMatch(/^\d{6}$/);
    });
  });

  describe('deleteFromRedis', () => {
    it('should delete the value from Redis for the specified key', async () => {
      const key = 'test-key';

      await deleteFromRedis(key);

      expect(redis.redisClientMock.del).toHaveBeenCalledWith(key);
    });

    // it('should handle errors when deleting value from Redis', async () => {
    //   const key = 'test-key';

    //   const error = new Error('Redis error');
    //   redis.redisClientMock.del.mockImplementationOnce(util.promisify((_, callback) => {
    //     callback(error);
    //   }));

    //   await expect(otpUtil.deleteFromRedis(key)).rejects.toThrow(error);
    //   expect(redis.redisClientMock.del).toHaveBeenCalledWith(key);
    //   expect(console.error).toHaveBeenCalledWith(error);
    // });
  });
});
