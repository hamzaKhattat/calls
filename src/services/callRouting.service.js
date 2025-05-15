const db = require('../config/database');
const asterisk = require('../config/asterisk');

class CallRoutingService {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    // Initialize connection to Asterisk
    await asterisk.connect();
    
    // Load DIDs and server configurations
    await this.loadDids();
    await this.loadServers();
    
    this.initialized = true;
  }

  async loadDids() {
    // Load DIDs from database
    const [rows] = await db.query('SELECT * FROM dids');
    this.dids = rows;
  }

  async loadServers() {
    // Load server configurations from database
    const [rows] = await db.query('SELECT * FROM external_servers WHERE active = TRUE');
    this.servers = rows;
  }

  async getAvailableDid() {
    // Get a random available DID
    const [rows] = await db.query('SELECT * FROM dids WHERE in_use = FALSE ORDER BY RAND() LIMIT 1');
    
    if (rows.length === 0) {
      throw new Error('No available DIDs found');
    }
    
    return rows[0];
  }

  async markDidAsInUse(did, destination) {
    // Mark a DID as in use and associate it with a destination
    await db.query(
      'UPDATE dids SET in_use = TRUE, destination = ? WHERE did = ?',
      [destination, did]
    );
  }

  async markDidAsAvailable(did) {
    // Mark a DID as available and clear its destination
    await db.query(
      'UPDATE dids SET in_use = FALSE, destination = NULL WHERE did = ?',
      [did]
    );
  }

  async handleIncomingCall(ani, dnis) {
    try {
      // Get an available DID
      const availableDid = await this.getAvailableDid();
      
      // Mark the DID as in use and associate it with the original DNIS
      await this.markDidAsInUse(availableDid.did, dnis);
      
      // Create a record of the routed call
      const [result] = await db.query(
        'INSERT INTO routed_calls (original_ani, original_dnis, new_ani, assigned_did, server_path) VALUES (?, ?, ?, ?, ?)',
        [ani, dnis, dnis, availableDid.did, 'S1->S2']
      );
      
      const routedCallId = result.insertId;
      
      // Forward the call to external server (S3) with the new ANI (DNIS) and the selected DID
      await asterisk.forwardCall(dnis, availableDid.did, 'S3');
      
      return {
        success: true,
        routedCallId,
        originalAni: ani,
        originalDnis: dnis,
        newAni: dnis,
        assignedDid: availableDid.did
      };
    } catch (error) {
      console.error('Error handling incoming call:', error);
      throw error;
    }
  }

  async handleReturnCall(ani, did) {
    try {
      // Find the original information associated with this DID
      const [rows] = await db.query('SELECT * FROM dids WHERE did = ?', [did]);
      
      if (rows.length === 0) {
        throw new Error('DID not found');
      }
      
      const originalDnis = rows[0].destination;
      
      if (!originalDnis) {
        throw new Error('No destination associated with this DID');
      }
      
      // Find the routed call record
      const [callRows] = await db.query(
        'SELECT * FROM routed_calls WHERE assigned_did = ? AND status = "in_progress"',
        [did]
      );
      
      if (callRows.length === 0) {
        throw new Error('No active call found for this DID');
      }
      
      const routedCall = callRows[0];
      
      // Update the server path
      const newServerPath = `${routedCall.server_path}->Sx->S2`;
      
      await db.query(
        'UPDATE routed_calls SET server_path = ? WHERE id = ?',
        [newServerPath, routedCall.id]
      );
      
      // Mark the DID as available
      await this.markDidAsAvailable(did);
      
      // Forward the call back to the final destination with original ANI and DNIS
      await asterisk.forwardCall(routedCall.original_ani, routedCall.original_dnis, 'S4');
      
      // Update the call status to completed
      await db.query(
        'UPDATE routed_calls SET status = "completed", end_time = NOW() WHERE id = ?',
        [routedCall.id]
      );
      
      return {
        success: true,
        routedCallId: routedCall.id,
        originalAni: routedCall.original_ani,
        originalDnis: routedCall.original_dnis
      };
    } catch (error) {
      console.error('Error handling return call:', error);
      throw error;
    }
  }

  async validateCall(callId) {
    try {
      // Verify if the call exists
      const [rows] = await db.query('SELECT * FROM routed_calls WHERE id = ?', [callId]);
      
      if (rows.length === 0) {
        return { validated: false, message: 'Call not found' };
      }
      
      const call = rows[0];
      
      // Verify if the destination matches what we expect
      const destinationCorrect = await this.checkDestinationCorrect(call.original_dnis);
      
      if (destinationCorrect) {
        await db.query(
          'UPDATE routed_calls SET status = "completed" WHERE id = ?',
          [callId]
        );
        
        return { validated: true, message: 'Call successfully validated' };
      } else {
        await db.query(
          'UPDATE routed_calls SET status = "failed" WHERE id = ?',
          [callId]
        );
        
        return { validated: false, message: 'Call destination validation failed' };
      }
    } catch (error) {
      console.error('Error validating call:', error);
      throw error;
    }
  }

  async checkDestinationCorrect(dnis) {
    // In a real implementation, this would verify with the destination server
    // For this example, just simulate a check
    try {
      // This would be a call to the destination server or some validation logic
      return Math.random() > 0.1; // 90% success rate for demonstration
    } catch (error) {
      console.error('Error checking destination:', error);
      return false;
    }
  }

  async uploadDids(didsArray) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      for (const did of didsArray) {
        await connection.query(
          'INSERT INTO dids (did, country) VALUES (?, ?)',
          [did.did, did.country || null]
        );
      }
      
      await connection.commit();
      
      // Reload DIDs after upload
      await this.loadDids();
      
      return { success: true, count: didsArray.length };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getDidsStatus() {
    try {
      const [rows] = await db.query(
        'SELECT COUNT(*) as total, ' +
        'SUM(CASE WHEN in_use = TRUE THEN 1 ELSE 0 END) as in_use, ' +
        'SUM(CASE WHEN in_use = FALSE THEN 1 ELSE 0 END) as available ' +
        'FROM dids'
      );
      
      return rows[0];
    } catch (error) {
      console.error('Error getting DIDs status:', error);
      throw error;
    }
  }
}