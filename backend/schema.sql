-- Energy Management Database Schema
-- PostgreSQL 14+

-- Create measurements table
CREATE TABLE IF NOT EXISTS measurements (
    id BIGSERIAL PRIMARY KEY,
    location VARCHAR(100) NOT NULL,
    metric VARCHAR(100) NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(20),
    phase VARCHAR(10),
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_measurements_location ON measurements(location);
CREATE INDEX idx_measurements_metric ON measurements(metric);
CREATE INDEX idx_measurements_location_metric_time ON measurements(location, metric, captured_at DESC);
CREATE INDEX idx_measurements_captured_at ON measurements(captured_at DESC);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    modbus_host VARCHAR(100),
    modbus_port INTEGER DEFAULT 502,
    modbus_unit_id INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default locations
INSERT INTO locations (name, display_name, modbus_host) VALUES
    ('sala-sport', 'SALA SPORT', '192.168.1.100'),
    ('corp-a', 'CORP A', '192.168.1.101'),
    ('corp-b', 'CORP B', '192.168.1.102'),
    ('aula-1', 'AULA 1', '192.168.1.103'),
    ('aula-2', 'AULA 2', '192.168.1.104')
ON CONFLICT (name) DO NOTHING;

-- Create view for latest measurements
CREATE OR REPLACE VIEW latest_measurements AS
SELECT DISTINCT ON (location, metric, phase)
    id,
    location,
    metric,
    value,
    unit,
    phase,
    captured_at
FROM measurements
ORDER BY location, metric, phase, captured_at DESC;

-- Create function to clean old data (optional)
CREATE OR REPLACE FUNCTION clean_old_measurements(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM measurements
    WHERE captured_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
