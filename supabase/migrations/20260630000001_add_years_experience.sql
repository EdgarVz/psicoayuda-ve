-- Add years_experience column to psychologist_profiles
ALTER TABLE psychologist_profiles ADD COLUMN years_experience INT;

COMMENT ON COLUMN psychologist_profiles.years_experience IS 'Años de experiencia profesional del psicólogo';
