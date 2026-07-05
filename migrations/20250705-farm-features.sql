-- Idempotent migration: safe to run multiple times on production (Vercel/Neon/Supabase)

-- Cow ownership (multi-tenancy)
ALTER TABLE cows ADD COLUMN IF NOT EXISTS "ownerId" UUID REFERENCES users(id) ON DELETE SET NULL;

-- Farm diary
CREATE TABLE IF NOT EXISTS farm_diaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "cowId" UUID REFERENCES cows(id) ON DELETE SET NULL,
  "entryDate" DATE NOT NULL,
  weather VARCHAR(255),
  "feedNotes" TEXT,
  content TEXT NOT NULL,
  photos VARCHAR(255)[] DEFAULT '{}',
  "shareToFeed" BOOLEAN DEFAULT FALSE,
  "voiceNoteUrl" VARCHAR(255),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Milk records
DO $$ BEGIN
  CREATE TYPE milk_session AS ENUM ('morning', 'evening');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS milk_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "cowId" UUID REFERENCES cows(id) ON DELETE SET NULL,
  "recordDate" DATE NOT NULL,
  session milk_session NOT NULL,
  liters DOUBLE PRECISION NOT NULL,
  "fatPercent" DOUBLE PRECISION,
  notes TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vaccinations
DO $$ BEGIN
  CREATE TYPE vaccination_status AS ENUM ('scheduled', 'completed', 'overdue', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "cowId" UUID NOT NULL REFERENCES cows(id) ON DELETE CASCADE,
  "vaccineName" VARCHAR(255) NOT NULL,
  "scheduledDate" DATE NOT NULL,
  "administeredDate" DATE,
  status vaccination_status DEFAULT 'scheduled',
  "vetName" VARCHAR(255),
  notes TEXT,
  "nextDueDate" DATE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pregnancies
DO $$ BEGIN
  CREATE TYPE pregnancy_status AS ENUM ('confirmed', 'in_progress', 'calved', 'aborted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS pregnancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "cowId" UUID NOT NULL REFERENCES cows(id) ON DELETE CASCADE,
  "conceptionDate" DATE NOT NULL,
  "expectedCalvingDate" DATE,
  "actualCalvingDate" DATE,
  status pregnancy_status DEFAULT 'confirmed',
  "sireName" VARCHAR(255),
  notes TEXT,
  "calfId" UUID REFERENCES cows(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Milk collections
DO $$ BEGIN
  CREATE TYPE collection_status AS ENUM ('pending', 'accepted', 'rejected', 'paid');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS milk_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "collectionDate" DATE NOT NULL,
  "totalLiters" DOUBLE PRECISION NOT NULL,
  "fatPercent" DOUBLE PRECISION,
  "snfPercent" DOUBLE PRECISION,
  "ratePerLiter" DECIMAL(12,2),
  "totalAmount" DECIMAL(12,2),
  status collection_status DEFAULT 'pending',
  "cooperativeName" VARCHAR(255),
  "rejectionReason" TEXT,
  notes TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Knowledge articles
DO $$ BEGIN
  CREATE TYPE article_category AS ENUM ('health', 'breeding', 'feeding', 'general', 'disease');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "authorId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category article_category DEFAULT 'general',
  tags VARCHAR(255)[] DEFAULT '{}',
  upvotes INTEGER DEFAULT 0,
  "isVerified" BOOLEAN DEFAULT FALSE,
  "isPublished" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Push tokens
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  platform VARCHAR(255),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- IoT device keys
CREATE TABLE IF NOT EXISTS device_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "cowId" UUID REFERENCES cows(id) ON DELETE SET NULL,
  "apiKey" VARCHAR(255) NOT NULL UNIQUE,
  "deviceName" VARCHAR(255) NOT NULL,
  "isActive" BOOLEAN DEFAULT TRUE,
  "lastUsedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Password resets
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
