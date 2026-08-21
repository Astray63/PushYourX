-- Purge quotidienne des identifiants de visiteurs (3h15 UTC).
-- Sans planification, purge_visits() ne serait jamais appelée et la
-- rétention de 30 jours ne resterait qu'une intention.

create extension if not exists pg_cron;

select cron.schedule('purge-visits', '15 3 * * *', $$select public.purge_visits()$$);
