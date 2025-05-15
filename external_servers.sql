CREATE TABLE external_servers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  server_type ENUM('origin', 'intermediate', 'destination') NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  port INT NOT NULL,
  username VARCHAR(50),
  password VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);