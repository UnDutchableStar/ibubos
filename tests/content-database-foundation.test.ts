import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const readRequiredFile = (path: string) => {
    assert.ok(existsSync(path), `${path} must exist`);
    return readFileSync(path, 'utf8');
};

test('documents every backend environment variable', () => {
    const envExample = readRequiredFile('.env.example');

    for (const key of [
        'DATABASE_URL',
        'BLOB_READ_WRITE_TOKEN',
        'CRON_SECRET',
        'NEON_AUTH_BASE_URL',
        'NEXT_PUBLIC_NEON_AUTH_URL',
        'NEON_AUTH_COOKIE_SECRET'
    ]) {
        assert.match(envExample, new RegExp(`^${key}=`, 'm'));
    }
});

test('allows remote images from public Vercel Blob hosts', () => {
    const nextConfig = readRequiredFile('next.config.ts');

    assert.match(nextConfig, /remotePatterns/);
    assert.match(nextConfig, /protocol:\s*['"]https['"]/);
    assert.match(nextConfig, /hostname:\s*['"]\*\*\.public\.blob\.vercel-storage\.com['"]/);
});

test('configures Drizzle Kit for the content schema and PostgreSQL', () => {
    const drizzleConfig = readRequiredFile('drizzle.config.ts');

    assert.match(drizzleConfig, /dialect:\s*['"]postgresql['"]/);
    assert.match(drizzleConfig, /schema:\s*['"]\.\/src\/lib\/db\/schema\.ts['"]/);
    assert.match(drizzleConfig, /out:\s*['"]\.\/drizzle['"]/);
    assert.match(drizzleConfig, /DATABASE_URL/);
});

test('defines the content entries schema and its database constraints', () => {
    const schema = readRequiredFile('src/lib/db/schema.ts');

    assert.match(schema, /pgTable\(\s*['"]content_entries['"]/);
    assert.match(schema, /uuid\(\s*['"]id['"]\s*\).*defaultRandom\(\).*primaryKey\(\)/s);
    assert.match(schema, /check\(\s*['"]content_entries_type_check['"]/);
    assert.match(schema, /check\(\s*['"]content_entries_status_check['"]/);
    assert.match(schema, /unique(?:Index)?\(\s*['"]content_entries_type_slug_unique['"]/);

    for (const column of ['slug', 'title', 'description', 'image', 'label', 'intro']) {
        assert.match(schema, new RegExp(`text\\(\\s*['"]${column}['"]`));
    }

    assert.match(schema, /jsonb\(\s*['"]sections['"]\s*\)/);
    assert.match(schema, /text\(\s*['"]tags['"]\s*\)\.array\(\)/);
    assert.match(schema, /text\(\s*['"]facts['"]\s*\)\.array\(\)/);

    for (const column of ['read_time', 'takeaway', 'outcome', 'published_at']) {
        assert.match(schema, new RegExp(`['"]${column}['"]`));
    }

    assert.match(schema, /timestamp\(\s*['"]created_at['"]/);
    assert.match(schema, /timestamp\(\s*['"]updated_at['"]/);
});

test('ships an explicit SQL migration matching the schema constraints', () => {
    const migration = readRequiredFile('drizzle/0000_content_entries.sql');

    assert.match(migration, /CREATE TABLE ['"]?content_entries['"]?/i);
    assert.match(migration, /CHECK\s*\(\s*['"]?type['"]?\s+IN\s*\(\s*'blog'\s*,\s*'project'\s*\)\s*\)/i);
    assert.match(migration, /CHECK\s*\(\s*['"]?status['"]?\s+IN\s*\(\s*'draft'\s*,\s*'published'\s*\)\s*\)/i);
    assert.match(migration, /UNIQUE\s*\(\s*['"]?type['"]?\s*,\s*['"]?slug['"]?\s*\)/i);
    assert.match(migration, /['"]?sections['"]?\s+jsonb/i);
    assert.match(migration, /['"]?tags['"]?\s+text\[\]/i);
    assert.match(migration, /['"]?facts['"]?\s+text\[\]/i);
});

test('ships an idempotent planned_at migration for older databases', () => {
    const migration = readRequiredFile('drizzle/0001_planned_at.sql');

    assert.match(migration, /ALTER TABLE ['"]?content_entries['"]?/i);
    assert.match(migration, /ADD COLUMN IF NOT EXISTS ['"]?planned_at['"]?/i);
    assert.match(migration, /timestamp with time zone/i);
});

test('exposes a lazy nullable database client contract', () => {
    const client = readRequiredFile('src/lib/db/client.ts');

    assert.match(client, /export\s+(?:const|function)\s+isDatabaseConfigured/);
    assert.match(client, /export\s+(?:const|function)\s+getDb/);
    assert.match(client, /process\.env\.DATABASE_URL/);
    assert.match(client, /return null/);
});
