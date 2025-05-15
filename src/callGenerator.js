const db = require('../config/database');
const asterisk = require('../config/asterisk');
const statisticsService = require('./statistics.service');

class CallGenerator {
  constructor() {
    this.activeCallCount = 0;
    this.running = false;
    this.config = null;
    this.phoneNumbers = [];
    this.callQueue = [];
  }

  async initialize() {
    // Load configuration from database
    this.config = await this.loadConfiguration();
    
    // Load phone numbers
    this.phoneNumbers = await this.loadPhoneNumbers();
    
    // Initialize connection to Asterisk server
    await asterisk.connect();
  }

  async loadConfiguration() {
    // Load the latest configuration from the database
    const [rows] = await db.query('SELECT * FROM call_configurations ORDER BY id DESC LIMIT 1');
    return rows[0] || null;
  }

  async loadPhoneNumbers() {
    // Load all phone numbers from the database
    const [rows] = await db.query('SELECT * FROM phone_numbers');
    return rows;
  }

  async start() {
    if (this.running) return;
    
    this.running = true;
    
    // Start the scheduler
    this.scheduler = setInterval(() => this.processSchedule(), 1000);
  }

  async stop() {
    if (!this.running) return;
    
    this.running = false;
    
    // Stop the scheduler
    clearInterval(this.scheduler);
  }

  async processSchedule() {
    // Check if current time is within the scheduled hours
    if (!this.isWithinScheduledHours()) {
      return;
    }

    // Determine if we need to increase or decrease call volume
    if (this.shouldIncreaseCalls()) {
      this.increaseCalls();
    } else if (this.shouldDecreaseCalls()) {
      this.decreaseCalls();
    }

    // Process the call queue
    await this.processCallQueue();
  }

  isWithinScheduledHours() {
    const now = new Date();
    const day = now.getDay();
    const time = now.getHours() * 60 + now.getMinutes();

    // Check if it's a weekday (1-5) or weekend (0, 6)
    if (day >= 1 && day <= 5) {
      // Weekday
      const startTime = this.timeToMinutes(this.config.weekday_start_time);
      const endTime = this.timeToMinutes(this.config.weekday_end_time);
      return time >= startTime && time <= endTime;
    } else {
      // Weekend
      const startTime = this.timeToMinutes(this.config.weekend_start_time);
      const endTime = this.timeToMinutes(this.config.weekend_end_time);
      return time >= startTime && time <= endTime;
    }
  }

  timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  shouldIncreaseCalls() {
    // Logic to determine if we should increase call volume
    return this.activeCallCount < this.config.max_simultaneous_calls;
  }

  shouldDecreaseCalls() {
    // Logic to determine if we should decrease call volume
    return this.activeCallCount > this.config.min_simultaneous_calls;
  }

  increaseCalls() {
    // Add new calls to the queue based on the increase rate
    const callsToAdd = Math.min(
      this.config.increase_rate,
      this.config.max_simultaneous_calls - this.activeCallCount
    );

    for (let i = 0; i < callsToAdd; i++) {
      this.queueNewCall();
    }
  }

  decreaseCalls() {
    // Logic to decrease calls if needed
    // This might involve ending some existing calls
    const callsToRemove = Math.min(
      this.config.decrease_rate,
      this.activeCallCount - this.config.min_simultaneous_calls
    );

    // Signal to end some calls
    for (let i = 0; i < callsToRemove; i++) {
      this.endRandomCall();
    }
  }

  queueNewCall() {
    // Select random ANI and DNIS
    const phoneNumberIndex = Math.floor(Math.random() * this.phoneNumbers.length);
    const phoneNumber = this.phoneNumbers[phoneNumberIndex];

    this.callQueue.push({
      ani: phoneNumber.ani,
      dnis: phoneNumber.dnis,
      country: phoneNumber.country,
      carrier: phoneNumber.carrier
    });
  }

  async processCallQueue() {
    while (this.callQueue.length > 0 && this.activeCallCount < this.config.max_simultaneous_calls) {
      const call = this.callQueue.shift();
      await this.initiateCall(call);
    }
  }

  async initiateCall(call) {
    try {
      this.activeCallCount++;

      // Generate a unique call ID
      const callId = `CALL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Create a call record in the database
      await db.query(
        'INSERT INTO calls (ani, dnis, status, call_id, server_a, server_b) VALUES (?, ?, ?, ?, ?, ?)',
        [call.ani, call.dnis, 'originated', callId, 'Server-A', 'Server-B']
      );

      // Initiate the call through Asterisk
      const response = await asterisk.initiateCall(call.ani, call.dnis, callId);

      // Determine if call should be answered based on ASR percentage
      const shouldAnswer = Math.random() * 100 <= this.config.asr_percentage;

      if (shouldAnswer) {
        // Simulate call being answered
        await this.handleCallAnswered(callId);
      } else {
        // Simulate call being rejected
        await this.handleCallRejected(callId);
      }

      // Update statistics
      statisticsService.updateCallStats({
        ani: call.ani,
        dnis: call.dnis,
        country: call.country,
        carrier: call.carrier,
        status: shouldAnswer ? 'answered' : 'rejected'
      });

    } catch (error) {
      console.error('Error initiating call:', error);
      this.activeCallCount--;
    }
  }

  async handleCallAnswered(callId) {
    try {
      // Update call status to ringing
      await db.query(
        'UPDATE calls SET status = ? WHERE call_id = ?',
        ['ringing', callId]
      );

      // Simulate call ringing for a random period (1-3 seconds)
      const ringingDuration = 1000 + Math.floor(Math.random() * 2000);
      await new Promise(resolve => setTimeout(resolve, ringingDuration));

      // Update call status to answered
      await db.query(
        'UPDATE calls SET status = ?, start_time = NOW() WHERE call_id = ?',
        ['answered', callId]
      );

      // Determine random call duration within ACD range
      const callDuration = this.config.min_duration + 
                          Math.floor(Math.random() * (this.config.max_duration - this.config.min_duration + 1));

      // Simulate call duration
      setTimeout(async () => {
        await this.endCall(callId);
      }, callDuration * 1000);

    } catch (error) {
      console.error('Error handling answered call:', error);
      await this.endCall(callId);
    }
  }

  async handleCallRejected(callId) {
    try {
      // Update call status to rejected
      await db.query(
        'UPDATE calls SET status = ? WHERE call_id = ?',
        ['rejected', callId]
      );

      // Decrease active call count
      this.activeCallCount--;

    } catch (error) {
      console.error('Error handling rejected call:', error);
    }
  }

  async endCall(callId) {
    try {
      // Update call status to hung_up
      await db.query(
        'UPDATE calls SET status = ?, end_time = NOW(), ' +
        'duration = TIMESTAMPDIFF(SECOND, start_time, NOW()) ' +
        'WHERE call_id = ?',
        ['hung_up', callId]
      );

      // Decrease active call count
      this.activeCallCount--;

    } catch (error) {
      console.error('Error ending call:', error);
      this.activeCallCount--;
    }
  }

  async endRandomCall() {
    try {
      // Get a random active call
      const [rows] = await db.query(
        'SELECT call_id FROM calls WHERE status = "answered" LIMIT 1'
      );

      if (rows.length > 0) {
        await this.endCall(rows[0].call_id);
      }
    } catch (error) {
      console.error('Error ending random call:', error);
    }
  }
}

module.exports = new CallGenerator();