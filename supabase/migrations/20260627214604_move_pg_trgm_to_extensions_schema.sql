-- pg_trgm lag im public-Schema (Advisor extension_in_public).
-- In das dedizierte extensions-Schema verschieben. Der abhängige
-- GIN-Index idx_profiles_username_trgm wandert via Dependency mit.
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;
