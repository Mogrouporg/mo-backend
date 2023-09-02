const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const paystack = require('../payment.utils');

describe('Paystack Module', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('initializePayment', () => {
    it('should send a POST request to initialize payment', async () => {
      const form = { amount: 50000, email: 'test@example.com' };
      const expectedOptions = {
        url: 'https://api.paystack.co/transaction/initialize',
        headers: {
          authorization: 'Bearer sk_test_0ad0bb1d27f536e3d916f82dbf153991e3e0d6b9',
          'content-type': 'application/json',
        },
        form,
      };

      const callback = jest.fn();

      mock.onPost(expectedOptions.url).reply(200);

      await paystack.initializePayment(form)
          .then(callback)
          .catch(error => console.error(error));

      expect(callback).toHaveBeenCalled();
    });
  });
});
