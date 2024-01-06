const { acmh } = require('./awardCoSentHandler');
const mockHubot = require('../../test/mockHubot');
const { us } = require('./service/UserService');

const { wait } = require('../../test/util');

describe('AwardCoSentHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    us.getUser = jest.fn().mockResolvedValue({ awardCoDM: true });
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

    await acmh.handleAwardCoSent(mockHubot, awardResponses);
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

    await acmh.handleAwardCoSent(mockHubot, awardResponses);
    await wait(); // Silly hubot timing things

    expect(mockHubot.messageRoom).not.toHaveBeenCalled();
    expect(awardResponses[0].event.msg.send).toHaveBeenCalled();
  });
});
