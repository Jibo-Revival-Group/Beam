require('../lib/node_loader');
var Jibo = require('../lib/core');

module.exports = {
  Log: require('./log'),
  LogAdmin: require('./logadmin'),
  Push: require('./push'),
  Account: require('./account'),
  AccountAdmin: require('./accountadmin'),
  Backup: require('./backup'),
  Notification: require('./notification'),
  Update: require('./update'),
  UpdateAdmin: require('./updateadmin'),
  Robot: require('./robot'),
  RobotAdmin: require('./robotadmin'),
  Key: require('./key'),
  Loop: require('./loop'),
  Lps: require('./lps'),
  Media: require('./media'),
  MediaAdmin: require('./mediaadmin'),
  Person: require('./person'),
  GQA: require('./gqa'),
  OOBE: require('./oobe'),
  NLP: require('./nlp'),
  Collision: require('./collision'),
  IFTTT: require('./ifttt'),
  OOBEAdmin: require('./oobeadmin'),
  ROM: require('./rom'),
  OauthClientsAdmin: require('./oauthclientsadmin'),
  Settings: require('./settings')
};