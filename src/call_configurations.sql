CREATE TABLE call_configurations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  min_duration INT NOT NULL, -- ACD min in seconds
  max_duration INT NOT NULL, -- ACD max in seconds
  asr_percentage INT NOT NULL, -- Answered call rate 0-100%
  weekday_start_time TIME,
  weekday_end_time TIME,
  weekend_start_time TIME,
  weekend_end_time TIME,
  increase_rate INT NOT NULL, -- Calls per minute to add
  decrease_rate INT NOT NULL, -- Calls per minute to reduce
  min_simultaneous_calls INT NOT NULL,
  max_simultaneous_calls INT NOT NULL,
  autopilot BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);