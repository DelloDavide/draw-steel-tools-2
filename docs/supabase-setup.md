# Supabase Setup — Draw Steel Bestiary

## 1. Crea la tabella `bestiary_documents`

Vai su **Supabase Dashboard → SQL Editor** e esegui:

```sql
-- Tabella principale per tutti i documenti JSON del bestiary
CREATE TABLE bestiary_documents (
  path TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indice per ricerche per tipo
CREATE INDEX idx_bestiary_type ON bestiary_documents (type);

-- Indice per ricerche per nome
CREATE INDEX idx_bestiary_name ON bestiary_documents (name);

-- Abilita Row Level Security
ALTER TABLE bestiary_documents ENABLE ROW LEVEL SECURITY;

-- Policy: tutti possono leggere
CREATE POLICY "Public read access"
  ON bestiary_documents
  FOR SELECT
  USING (true);

-- Policy: tutti possono inserire (per lo script di migrazione)
CREATE POLICY "Public insert access"
  ON bestiary_documents
  FOR INSERT
  WITH CHECK (true);

-- Policy: tutti possono aggiornare (per il save dei progetti)
CREATE POLICY "Public update access"
  ON bestiary_documents
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

## 2. Crea il bucket per le immagini eroi

Vai su **Storage → New Bucket**:
- Nome: `hero-images`
- Public: **sì** (toggle ON)

Oppure via SQL:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true);
```

## 3. Policy di accesso al bucket

```sql
-- Chiunque può leggere le immagini
CREATE POLICY "Public read hero images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'hero-images');

-- Chiunque può caricare immagini (per migrazione)
CREATE POLICY "Public upload hero images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'hero-images');
```

## 4. Esegui lo script di migrazione

Dopo aver creato tabella e bucket, esegui lo script di migrazione nel browser
aprendo il plugin in dev mode con `?dev=true` e cliccando i pulsanti di migrazione,
oppure esegui direttamente:

```bash
npx tsx scripts/migrateToSupabase.ts
```

## 5. Variabili d'ambiente

Assicurati che `.env` contenga:

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

E che le stesse variabili siano configurate su **Render** nelle Environment Variables.
