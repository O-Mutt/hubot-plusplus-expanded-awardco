# hubot-plusplus-expanded-awardco

## Purpose
This project is intended to be used in conjunction with the [Hubot-PlusPlus-Expanded](https://github.com/O-Mutt/hubot-plusplus-expanded) project to enable the plusplus to also send out [AwardCo Awards](https://www.award.co/). 

## Configuration
In order to enable this in your hubot you must set your bonusly api key on the env variable:
```
process.env.MONGO_URI || 'mongodb://localhost/plusPlus';
process.env.AWARDCO_API_KEY;
process.env.AWARDCO_URI;
```
It also uses a awardco_uri to allow for dev environments (proxys) to be used and a mongo uri to look up users.
