-- Create sequences for ticket and booking number generation (idempotent)
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START WITH 1 MAXVALUE 9999 CYCLE;
CREATE SEQUENCE IF NOT EXISTS booking_number_seq START WITH 1 MAXVALUE 9999 CYCLE;
