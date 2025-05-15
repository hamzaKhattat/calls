CREATE TABLE routed_calls (
  id INT PRIMARY KEY AUTO_INCREMENT,
  original_ani VARCHAR(20) NOT NULL,
  original_dnis VARCHAR(20) NOT NULL,
  new_ani VARCHAR(20) NOT NULL,
  assigned_did VARCHAR(20) NOT NULL,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  status ENUM('in_progress', 'completed', 'failed') DEFAULT 'in_progress',
  server_path VARCHAR(255), -- To store the path of servers the call went through
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);