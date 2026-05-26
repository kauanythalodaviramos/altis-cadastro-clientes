-- =============================================================
-- Setup do schema da aplicacao no Oracle XE 21c
-- Container: XEPDB1 (Pluggable Database)
-- Executar conectado como SYSTEM no XEPDB1:
--   sqlplus SYSTEM/<senha>@//localhost:1521/XEPDB1 @01_setup_oracle.sql
-- =============================================================

SET ECHO ON
SET FEEDBACK ON
SET SERVEROUTPUT ON

-- 1. Garantir que estamos no PDB correto
SELECT 'Container atual: ' || SYS_CONTEXT('USERENV','CON_NAME') AS info FROM DUAL;

-- 2. Limpar user antigo se existir (idempotente)
WHENEVER SQLERROR CONTINUE;
DROP USER PROJETO CASCADE;
WHENEVER SQLERROR EXIT SQL.SQLCODE;

-- 3. Criar o usuario da aplicacao
CREATE USER PROJETO IDENTIFIED BY "Altis_2026"
  DEFAULT TABLESPACE USERS
  TEMPORARY TABLESPACE TEMP
  QUOTA UNLIMITED ON USERS;

-- 4. Grants minimos para o app criar/manipular suas tabelas
GRANT CREATE SESSION TO PROJETO;
GRANT CREATE TABLE TO PROJETO;
GRANT CREATE SEQUENCE TO PROJETO;
GRANT CREATE TRIGGER TO PROJETO;
GRANT CREATE VIEW TO PROJETO;
GRANT CREATE PROCEDURE TO PROJETO;

-- 5. Confirmar
SELECT username, account_status, default_tablespace
FROM dba_users
WHERE username = 'PROJETO';

EXIT;
