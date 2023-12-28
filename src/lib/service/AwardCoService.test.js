// AwardCoService.test.js
const { beforeEach, describe } = require('@jest/globals');
const Helpers = require('../helpers');
const mockHubot = require('../../../test/mockHubot');

describe('AwardCoService', () => {
  let axiosMock;
  let processVariables;
  let AwardCoService;
  let instance;

  beforeEach(async () => {
    processVariables = Helpers.createProcVars(mockHubot.name);
    axiosMock = require('axios');
    axiosMock.create.mockReturnThis();
    jest.mock('axios');
    AwardCoService = require('./AwardCoService');

    instance = new AwardCoService(mockHubot, processVariables);
  });

  describe('constructor', () => {
    test('constructor should set the correct properties', () => {
      // clear the call in the before each
      expect(instance.robot).toStrictEqual(mockHubot);
      expect(instance.apiKey).toStrictEqual(processVariables.awardCoApiKey);
      expect(instance.url).toStrictEqual(processVariables.awardCoUri);
      expect(instance.defaultNote).toStrictEqual(
        processVariables.awardCoDefaultNote,
      );
      expect(axiosMock.create).toHaveBeenCalled();
    });
  });

  describe('sendAwards', () => {
    beforeEach(() => {
      axiosMock.post.mockResolvedValue({
        data: {
          status: 'success',
          message: 'Awarded!',
          data: {
            id: '5f9f7a5a3b1d0c0011a8c4f8',
            email: '',
            rewardedBy: '',
            amount: 0,
            note: '',
            createdAt: '2020-11-02T16:46:02.000Z',
            updatedAt: '2020-11-02T16:46:02.000Z',
          },
        },
      });

      instance = new AwardCoService(mockHubot, processVariables);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('should call `/reward` with award and return', async () => {
      const awards = [
        {
          sender: {
            slackEmail: 'derp@derp.com',
          },
          recipient: {
            slackEmail: 'rec_derp@derp.com',
          },
        },
      ];

      const responses = await instance.sendAwards(awards);

      expect(axiosMock.post).toHaveBeenCalled();
      expect(axiosMock.post).toHaveBeenCalledWith('/reward', {
        apiKey: processVariables.awardCoApiKey,
        email: awards[0].recipient.slackEmail,
        rewardedBy: awards[0].sender.slackEmail,
        note: processVariables.awardCoDefaultNote,
      });

      expect(responses).not.toBeUndefined();
      expect(Array.isArray(responses)).toStrictEqual(true);
      expect(responses.length).toStrictEqual(awards.length);

      expect(responses[0]).toHaveProperty('event');
      expect(responses[0].event).toHaveProperty('sender');
      expect(responses[0].event.sender).toHaveProperty('slackEmail');
      expect(responses[0].event.sender.slackEmail).toStrictEqual(
        'derp@derp.com',
      );

      expect(responses[0]).toHaveProperty('event');
      expect(responses[0].event).toHaveProperty('recipient');
      expect(responses[0].event.recipient).toHaveProperty('slackEmail');
      expect(responses[0].event.recipient.slackEmail).toStrictEqual(
        'rec_derp@derp.com',
      );

      expect(responses[0]).toHaveProperty('response');
      expect(responses[0].response).toHaveProperty('status');
      expect(responses[0].response).toHaveProperty('message');
      expect(responses[0].response).toHaveProperty('data');
      expect(typeof responses[0].response.data).toStrictEqual('object');
    });

    test('should call `/reward` the same number of awards being sent', async () => {
      const awards = [
        {
          sender: {
            slackEmail: 'derp@derp.com',
          },
          recipient: {
            slackEmail: 'rec_derp@derp.com',
          },
        },
        {
          sender: {
            slackEmail: 'derp1@derp.com',
          },
          recipient: {
            slackEmail: 'rec_derp1@derp.com',
          },
        },
        {
          sender: {
            slackEmail: 'derp2@derp.com',
          },
          recipient: {
            slackEmail: 'rec_derp2@derp.com',
          },
        },
      ];

      const responses = await instance.sendAwards(awards);

      expect(axiosMock.post).toHaveBeenCalled();
      expect(axiosMock.post).toHaveBeenCalledTimes(3);
      expect(axiosMock.post).toHaveBeenCalledWith('/reward', {
        apiKey: processVariables.awardCoApiKey,
        email: awards[0].recipient.slackEmail,
        rewardedBy: awards[0].sender.slackEmail,
        note: processVariables.awardCoDefaultNote,
      });
      expect(axiosMock.post).toHaveBeenCalledWith('/reward', {
        apiKey: processVariables.awardCoApiKey,
        email: awards[1].recipient.slackEmail,
        rewardedBy: awards[1].sender.slackEmail,
        note: processVariables.awardCoDefaultNote,
      });
      expect(axiosMock.post).toHaveBeenCalledWith('/reward', {
        apiKey: processVariables.awardCoApiKey,
        email: awards[2].recipient.slackEmail,
        rewardedBy: awards[2].sender.slackEmail,
        note: processVariables.awardCoDefaultNote,
      });

      expect(responses).not.toBeUndefined();
      expect(Array.isArray(responses)).toStrictEqual(true);
      expect(responses.length).toStrictEqual(awards.length);
      expect(responses[0]).toHaveProperty('event');
      expect(responses[0]).toHaveProperty('event');
      expect(responses[0]).toHaveProperty('response');
      expect(responses[0].response.data).not.toBeUndefined();
    });
  });
});
