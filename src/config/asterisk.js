// src/config/asterisk.js

const AsteriskManager = require('asterisk-manager');
const config = require('./config');

class AsteriskService {
  constructor() {
    this.ami = null;
    this.connected = false;
  }

  async connect() {
    if (this.connected) return;

    return new Promise((resolve, reject) => {
      this.ami = new AsteriskManager(
        config.asterisk.port,
        config.asterisk.host,
        config.asterisk.username,
        config.asterisk.password,
        true
      );

      this.ami.on('connect', () => {
        console.log('Connected to Asterisk Manager Interface');
        this.connected = true;
        resolve();
      });

      this.ami.on('error', (err) => {
        console.error('Error connecting to Asterisk:', err);
        this.connected = false;
        reject(err);
      });

      this.ami.on('disconnect', () => {
        console.log('Disconnected from Asterisk Manager Interface');
        this.connected = false;
      });

      this.ami.action({
        action: 'Login',
        username: config.asterisk.username,
        secret: config.asterisk.password
      }, (err) => {
        if (err) {
          console.error('Error logging in to Asterisk:', err);
          reject(err);
        }
      });
    });
  }

  async disconnect() {
    if (!this.connected || !this.ami) return;

    return new Promise((resolve) => {
      this.ami.action({
        action: 'Logoff'
      }, () => {
        this.ami.disconnect();
        this.connected = false;
        resolve();
      });
    });
  }

  async initiateCall(ani, dnis, callId) {
    if (!this.connected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      this.ami.action({
        action: 'Originate',
        channel: `SIP/${ani}`,
        exten: dnis,
        context: 'from-internal',
        priority: 1,
        callerid: ani,
        variable: {
          'CALL_ID': callId
        },
        async: 'yes'
      }, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  async forwardCall(ani, dnis, server) {
    if (!this.connected) {
      await this.connect();
    }

    const serverConfig = config.servers[server];
    if (!serverConfig) {
      throw new Error(`Server configuration not found for ${server}`);
    }

    return new Promise((resolve, reject) => {
      this.ami.action({
        action: 'Originate',
        channel: `SIP/${serverConfig.trunk}`,
        exten: dnis,
        context: 'from-internal',
        priority: 1,
        callerid: ani,
        async: 'yes'
      }, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  async getCallStatus(callId) {
    if (!this.connected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      this.ami.action({
        action: 'CoreShowChannels'
      }, (err, res) => {
        if (err) {
          reject(err);
        } else {
          // Parse the response to find the channel with the given callId
          // This is a simplification - actual implementation would be more complex
          resolve(res);
        }
      });
    });
  }
}

module.exports = new AsteriskService();