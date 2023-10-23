const { isLeapYear, updateInvestmentsRoi, calculateAllMyDailyROI, processInvestments, processRealEstateInvestments, transferDueRoi } = require('../../cronJobs/roiUpdate');
const mongoose = require('mongoose');
mongoose.Model.bulkWrite = jest.fn();
const InvestmentModelMock = {
    find: jest.fn(),
    bulkWrite: jest.fn(),
    updateOne: jest.fn(),
};
const UserMock = {
    aggregate: jest.fn(),
    updateOne: jest.fn(),
};


describe('isLeapYear', () => {
    it('should return true for leap years', () => {
        expect(isLeapYear(2000)).toBe(true);
        expect(isLeapYear(2020)).toBe(true);
    });

    it('should return false for non-leap years', () => {
        expect(isLeapYear(2019)).toBe(false);
        expect(isLeapYear(2100)).toBe(false);
    });
});


describe('updateInvestmentsRoi', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should update investments ROI for given model', async () => {
        const mockInvestments = [
            {
                _id: '123',
                roi: 10,
            },
            {
                _id: '456',
                roi: 20,
            },
        ];
        mongoose.Model.find = jest.fn().mockResolvedValue(mockInvestments);

        await updateInvestmentsRoi(mongoose.Model, 'TestModel');

        expect(mongoose.Model.bulkWrite).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
        mongoose.Model.find = jest.fn().mockRejectedValue(new Error('Mock error'));

        // check if  error handling mechanisms are working, e.g., if it logs an error
        await expect(updateInvestmentsRoi(mongoose.Model, 'TestModel')).rejects.toThrow();

    });
});

describe('calculateAllMyDailyROI', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should calculate daily ROI for users', async () => {
      const mockUsers = [
        {
          _id: '123',
          investments: [
            {
              _id: '456',
              roi: 10,
            },
          ],
        },
      ];
      UserMock.aggregate.mockResolvedValue(mockUsers);
  
      await calculateAllMyDailyROI();
  
      expect(UserMock.updateOne).toHaveBeenCalled();
    });
  
    it('should handle errors gracefully', async () => {
      UserMock.aggregate.mockRejectedValue(new Error('DB error'));
  
      // Expect error handling to take place.
        await expect(calculateAllMyDailyROI()).rejects.toThrow();
    });
  });

  describe('transferDueRoi', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should transfer due ROI for users', async () => {
      const mockUsers = [
        {
          _id: '123',
          investments: [
            {
              _id: '456',
              roi: 10,
            },
          ],
        },
      ];
      UserMock.aggregate.mockResolvedValue(mockUsers);
  
      await transferDueRoi();
  
      expect(UserMock.updateOne).toHaveBeenCalled();
    });
  
    it('should handle errors gracefully', async () => {
      UserMock.aggregate.mockRejectedValue(new Error('DB error'));
  
      // Expect error handling to take place.
        await expect(transferDueRoi()).rejects.toThrow();
    });
  });
  
  


