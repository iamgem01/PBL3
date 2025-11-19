INSERT INTO role (role_id, role_name) VALUES ('0', 'USER') ON DUPLICATE KEY UPDATE role_name = 'USER';
INSERT INTO role (role_id, role_name) VALUES ('1', 'ADMIN') ON DUPLICATE KEY UPDATE role_name = 'ADMIN';

