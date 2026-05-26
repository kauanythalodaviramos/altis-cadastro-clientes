-- =============================================================
-- Reset de schema para a Fase 2 (multi-tenancy + album)
--
-- IMPORTANTE: roda como PROJETO no XEPDB1.
-- Apaga dados de CLIENTES para Hibernate poder recriar a tabela com
-- a nova estrutura (USUARIO_ID NOT NULL + UKs compostas por usuario).
--
--   sqlplus PROJETO/Altis_2026@//localhost:1521/XEPDB1 @02_reset_schema_para_v2.sql
-- =============================================================

SET ECHO ON
SET FEEDBACK ON

WHENEVER SQLERROR CONTINUE;

-- Tabelas que serao recriadas pelo Hibernate na proxima subida do backend.
-- Ordem importante: filhas primeiro.

DROP TABLE FOTO_TAGS CASCADE CONSTRAINTS;
DROP TABLE FOTOS CASCADE CONSTRAINTS;
DROP TABLE TAGS CASCADE CONSTRAINTS;
DROP TABLE EMOCOES CASCADE CONSTRAINTS;
DROP TABLE CLIENTES CASCADE CONSTRAINTS;
DROP TABLE USERS CASCADE CONSTRAINTS;

WHENEVER SQLERROR EXIT SQL.SQLCODE;

SELECT 'Reset concluido. Suba o backend novo - Hibernate vai recriar tudo.' AS info FROM DUAL;

EXIT;
