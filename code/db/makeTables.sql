--psql -f makeTables.sql
DROP DATABASE IF EXISTS language_learning;
CREATE DATABASE language_learning;

-- CONNECTS TO THE DB... IF YOU DON'T DO THIS RELATIONS WON'T BE FOUND
\c language_learning;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE word (
  id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
  str VARCHAR,
  meaning VARCHAR,
  part_of_speech VARCHAR,
  metadata jsonb
);

CREATE TABLE learner (
  id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY
);

CREATE TABLE learner_word (
  learner_id uuid REFERENCES learner (id),
  word_id uuid REFERENCES word (id),
  CONSTRAINT UC_learner_word UNIQUE (learner_id, word_id)
);