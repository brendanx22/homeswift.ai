-- Grant permissions for the properties table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE properties TO homeswift_user;
GRANT USAGE, SELECT ON SEQUENCE properties_id_seq TO homeswift_user;

-- Grant permissions for the property_images table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE property_images TO homeswift_user;
GRANT USAGE, SELECT ON SEQUENCE property_images_id_seq TO homeswift_user;
