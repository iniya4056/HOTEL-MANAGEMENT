CREATE TABLE IF NOT EXISTS hotels (
    id          SERIAL PRIMARY KEY,                          
    title       VARCHAR(150)  NOT NULL,                      
    description TEXT          NOT NULL,                      
    latitude    NUMERIC(9,6)  NOT NULL
                CHECK (latitude  BETWEEN -90  AND 90),       
    longitude   NUMERIC(9,6)  NOT NULL
                CHECK (longitude BETWEEN -180 AND 180),      
    price       NUMERIC(10,2) NOT NULL CHECK (price > 0),    
    image_path  VARCHAR(255),                               
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),        
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()         
);

CREATE INDEX IF NOT EXISTS idx_hotels_price      ON hotels (price);                       
CREATE INDEX IF NOT EXISTS idx_hotels_title      ON hotels (LOWER(title));                
CREATE INDEX IF NOT EXISTS idx_hotels_created_at ON hotels (created_at DESC, id DESC);    

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hotels_updated_at ON hotels;
CREATE TRIGGER trg_hotels_updated_at
    BEFORE UPDATE ON hotels
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();



COMMENT ON TABLE  hotels             IS 'Hotels listed in the app (CRUD target table).';
COMMENT ON COLUMN hotels.id          IS 'Primary key, auto-generated.';
COMMENT ON COLUMN hotels.title       IS 'Hotel name shown on cards and detail page.';
COMMENT ON COLUMN hotels.description IS 'Full hotel description; cards show a short snippet.';
COMMENT ON COLUMN hotels.latitude    IS 'Decimal degrees, -90 to 90. Used to place the map marker.';
COMMENT ON COLUMN hotels.longitude   IS 'Decimal degrees, -180 to 180. Used to place the map marker.';
COMMENT ON COLUMN hotels.price       IS 'Price per night (currency shown in the UI as INR).';
COMMENT ON COLUMN hotels.image_path  IS 'Relative URL path of the image stored on the Node.js server.';
COMMENT ON COLUMN hotels.created_at  IS 'When the row was inserted.';
COMMENT ON COLUMN hotels.updated_at  IS 'Last modification time (maintained by trg_hotels_updated_at).';
