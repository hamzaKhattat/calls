const db = require('../config/database');

class StatisticsService {
  constructor() {
    this.stats = {
      totalCalls: 0,
      answeredCalls: 0,
      rejectedCalls: 0,
      totalDuration: 0,
      callsByCountry: {},
      callsByCarrier: {}
    };
  }

  async loadInitialStats() {
    // Load statistics from the database for today
    const today = new Date().toISOString().split('T')[0];
    
    // Get total calls
    const [totalRows] = await db.query(
      'SELECT COUNT(*) as count FROM calls WHERE DATE(created_at) = ?',
      [today]
    );
    this.stats.totalCalls = totalRows[0].count;
    
    // Get answered calls
    const [answeredRows] = await db.query(
      'SELECT COUNT(*) as count FROM calls WHERE status = "answered" AND DATE(created_at) = ?',
      [today]
    );
    this.stats.answeredCalls = answeredRows[0].count;
    
    // Get rejected calls
    const [rejectedRows] = await db.query(
      'SELECT COUNT(*) as count FROM calls WHERE status = "rejected" AND DATE(created_at) = ?',
      [today]
    );
    this.stats.rejectedCalls = rejectedRows[0].count;
    
    // Get total duration
    const [durationRows] = await db.query(
      'SELECT SUM(duration) as total FROM calls WHERE DATE(created_at) = ?',
      [today]
    );
    this.stats.totalDuration = durationRows[0].total || 0;
  }

  updateCallStats(callData) {
    // Update real-time statistics
    this.stats.totalCalls++;
    
    if (callData.status === 'answered') {
      this.stats.answeredCalls++;
    } else if (callData.status === 'rejected') {
      this.stats.rejectedCalls++;
    }
    
    // Update country stats
    if (callData.country) {
      this.stats.callsByCountry[callData.country] = 
        (this.stats.callsByCountry[callData.country] || 0) + 1;
    }
    
    // Update carrier stats
    if (callData.carrier) {
      this.stats.callsByCarrier[callData.carrier] = 
        (this.stats.callsByCarrier[callData.carrier] || 0) + 1;
    }
  }

  getCallStats() {
    return this.stats;
  }

  async getHistoricalStats(startDate, endDate) {
    // Get call statistics for a specific time period
    const [totalRows] = await db.query(
      'SELECT COUNT(*) as total_calls, ' +
      'SUM(CASE WHEN status = "answered" THEN 1 ELSE 0 END) as answered_calls, ' +
      'SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected_calls, ' +
      'AVG(duration) as avg_duration, ' +
      'SUM(duration) as total_duration ' +
      'FROM calls ' +
      'WHERE created_at BETWEEN ? AND ?',
      [startDate, endDate]
    );
    
    return totalRows[0];
  }

  async getCallDistribution(startDate, endDate, interval = 'hour') {
    // Get call distribution over time
    let timeFormat;
    if (interval === 'hour') {
      timeFormat = '%Y-%m-%d %H:00:00';
    } else if (interval === 'day') {
      timeFormat = '%Y-%m-%d';
    } else if (interval === 'month') {
      timeFormat = '%Y-%m';
    }
    
    const [rows] = await db.query(
      `SELECT 
        DATE_FORMAT(created_at, ?) as time_period,
        COUNT(*) as total_calls,
        SUM(CASE WHEN status = "answered" THEN 1 ELSE 0 END) as answered_calls,
        SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected_calls
      FROM calls
      WHERE created_at BETWEEN ? AND ?
      GROUP BY time_period
      ORDER BY time_period`,
      [timeFormat, startDate, endDate]
    );
    
    return rows;
  }
}

module.exports = new StatisticsService();