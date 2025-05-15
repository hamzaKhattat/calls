const fs = require('fs');
const csv = require('csv-parser');
const db = require('../config/database');

class CsvParser {
  async parsePhoneNumbers(filePath) {
    const results = [];
    const errors = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv({
          headers: ['ani', 'dnis'],
          skipLines: 1
        }))
        .on('data', (data) => {
          // Validate phone numbers
          if (this.isValidPhoneNumber(data.ani) && this.isValidPhoneNumber(data.dnis)) {
            results.push({
              ani: data.ani.trim(),
              dnis: data.dnis.trim()
            });
          } else {
            errors.push(`Invalid phone number: ${data.ani} or ${data.dnis}`);
          }
        })
        .on('end', () => {
          resolve({ results, errors });
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  isValidPhoneNumber(phoneNumber) {
    // Basic validation - can be enhanced
    return /^\d{7,15}$/.test(phoneNumber.trim());
  }

  async savePhoneNumbers(phoneNumbers) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      for (const phoneNumber of phoneNumbers) {
        await connection.query(
          'INSERT INTO phone_numbers (ani, dnis) VALUES (?, ?)',
          [phoneNumber.ani, phoneNumber.dnis]
        );
      }
      
      await connection.commit();
      return { success: true, count: phoneNumbers.length };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new CsvParser();