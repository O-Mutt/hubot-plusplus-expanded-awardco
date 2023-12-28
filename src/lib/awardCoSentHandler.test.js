const AwardCoSentHandler = require('./awardCoSentHandler');
const mockHubot = require('../../test/mockHubot');
const Helpers = require('./helpers');
const UserService = require('./service/UserService');
const { wait } = require('../../test/util');
jest.mock('./service/UserService');

describe('AwardCoSentHandler', () => {
  let instance;

  beforeEach(() => {
    jest.clearAllMocks();

    instance = new AwardCoSentHandler(mockHubot);
  });

  test('should handle successful award responses', async () => {
    const awardResponses = [
      {
        response: { success: true },
        event: {
          recipient: { slackId: 'recipient1' },
          sender: { slackId: 'sender1' },
          msg: { send: jest.fn() },
        },
      },
    ];

    await instance.handleAwardCoSent(awardResponses);
    await wait(); // Silly hubot timing things

    expect(mockHubot.messageRoom).toHaveBeenCalled();
    expect(awardResponses[0].event.msg.send).toHaveBeenCalled();
  });

  test('should handle unsuccessful award responses', async () => {
    const awardResponses = [
      {
        response: { success: false, message: 'error message' },
        event: {
          recipient: { slackId: 'recipient1' },
          sender: { slackId: 'sender1' },
          msg: { send: jest.fn() },
        },
      },
    ];

    await instance.handleAwardCoSent(awardResponses);
    await wait(); // Silly hubot timing things

    expect(mockHubot.messageRoom).not.toHaveBeenCalled();
    expect(awardResponses[0].event.msg.send).toHaveBeenCalled();
  });
});
