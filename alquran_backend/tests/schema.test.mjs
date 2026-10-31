import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

test('ownership, validation, atomic progress and account cascade', async () => {
  const db = new PGlite();
  const alice = '11111111-1111-4111-8111-111111111111';
  const bob = '22222222-2222-4222-8222-222222222222';
  try {
    await db.exec(`create role authenticated; create role anon; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid$$;
      grant usage on schema auth to authenticated, anon;
      insert into auth.users values ('${alice}'),('${bob}');`);
    await db.exec(readFileSync(new URL('../supabase/schemas/001_app.sql', import.meta.url), 'utf8').replace(/^\uFEFF/, ''));
    const user = async id => { await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub','${id}',false);`); };
    await user(alice);
    await db.exec(`insert into public.tilawah_notes(surah_name,ayah_count,read_date) values('Al-Fatihah',7,'2026-10-30');
      insert into public.tilawah_schedules(title,time) values('Pagi','05:00');
      insert into public.worship_reminders(title,time) values('Tilawah','05:00');
      insert into public.khatam_targets(days,daily_pages) values(30,20);`);
    for (const table of ['tilawah_notes','tilawah_schedules','worship_reminders','khatam_targets']) {
      assert.equal((await db.query(`select * from public.${table}`)).rows.length, 1);
      await assert.rejects(db.exec(`update public.${table} set user_id='${bob}'`));
    }
    await user(bob);
    for (const table of ['tilawah_notes','tilawah_schedules','worship_reminders','khatam_targets']) {
      assert.equal((await db.query(`select * from public.${table}`)).rows.length, 0);
      assert.equal((await db.query(`delete from public.${table} returning *`)).rows.length, 0);
    }
    await assert.rejects(db.exec(`insert into public.tilawah_notes(user_id,surah_name,ayah_count,read_date) values('${alice}','An-Nas',6,'2026-10-30')`));
    assert.equal((await db.query(`select * from public.toggle_tilawah_schedule(1,'2026-10-30')`)).rows.length, 0);
    assert.equal((await db.query(`select * from public.toggle_worship_reminder(1)`)).rows.length, 0);
    await user(alice);
    assert.equal((await db.query(`select done_date::text as day from public.toggle_tilawah_schedule(1,'2026-10-30')`)).rows[0].day, '2026-10-30');
    assert.equal((await db.query(`select done_date from public.toggle_tilawah_schedule(1,'2026-10-30')`)).rows[0].done_date, null);
    assert.equal((await db.query('select enabled from public.toggle_worship_reminder(1)')).rows[0].enabled, false);
    await Promise.all([db.exec('select public.add_khatam_progress(20)'), db.exec('select public.add_khatam_progress(20)')]);
    assert.equal((await db.query('select pages_read from public.khatam_targets')).rows[0].pages_read,40);
    await db.exec('select public.add_khatam_progress(604)');
    assert.equal((await db.query('select pages_read from public.khatam_targets')).rows[0].pages_read,604);
    await assert.rejects(db.exec('select public.add_khatam_progress(-1)'));
    await assert.rejects(db.exec(`insert into public.tilawah_notes(surah_name,ayah_count,read_date) values(' ',0,'2026-10-30')`));
    await assert.rejects(db.exec(`insert into public.worship_reminders(title,time) values('Pagi','25:00')`));
    await db.exec('reset role; set role anon;');
    await assert.rejects(db.query('select * from public.tilawah_notes'));
    await assert.rejects(db.query('select public.add_khatam_progress(1)'));
    await db.exec(`reset role; delete from auth.users where id='${alice}'`);
    for (const table of ['tilawah_notes','tilawah_schedules','worship_reminders','khatam_targets']) assert.equal((await db.query(`select * from public.${table}`)).rows.length,0);
    await user(alice);
    await assert.rejects(db.exec(`insert into public.tilawah_notes(surah_name,ayah_count,read_date) values('An-Nas',6,'2026-10-30')`));
  } finally { await db.close(); }
});
