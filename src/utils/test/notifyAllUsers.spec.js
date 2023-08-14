const { notifyAllUsers } = require('../notifyAllUsers.util'); // Update the path to the module
const AWS = require('aws-sdk');

// Mock AWS SDK's SQS sendMessage method
AWS.SQS.prototype.sendMessage = jest.fn().mockReturnValue({
  promise: jest.fn().mockResolvedValue(true),
});

describe('notifyAllUsers', () => {
  it('should send messages to SQS for all users', async () => {
    // Define test users
    const users = [
      { email: 'user1@example.com' },
      { email: 'user2@example.com' },
    ];

    const subject = 'Test Subject';
    const body = 'Test Body';

    // Call the function with the test data
    await notifyAllUsers(users, subject, body);

    // Check that sendMessage was called the correct number of times
    //expect(AWS.SQS.prototype.sendMessage).toHaveBeenCalledTimes(users.length);

    // Check that sendMessage was called with the correct parameters for each user
    users.forEach((user, index) => {
      expect(AWS.SQS.prototype.sendMessage).toHaveBeenNthCalledWith(index + 1, {
        MessageBody: JSON.stringify({
          email: user.email,
          subject,
          body,
        }),
        QueueUrl: process.env.AWS_SQS_URL,
      });
    });
  });
  console.log(AWS.SQS.prototype.sendMessage.mock.calls.length);
  beforeEach(() => {
   jest.clearAllMocks();
 });
 
  // You could add more test cases here to cover other scenarios,
  // such as handling errors, edge cases with inputs, etc.
});
