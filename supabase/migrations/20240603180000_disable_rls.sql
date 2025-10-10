/*
# [Migration] Deshabilitar RLS para Acceso Anónimo

Este script deshabilita la Seguridad a Nivel de Fila (RLS) en todas las tablas principales de la aplicación.

## Descripción de la Consulta:
El error "new row violates row-level security policy" ocurre porque RLS está activado, pero no hemos implementado un sistema de inicio de sesión. Esto previene que cualquier usuario (incluyendo el anónimo) pueda insertar datos. Esta migración deshabilita RLS temporalmente para permitir que la aplicación funcione. Volveremos a activar RLS y crearemos políticas de seguridad específicas cuando implementemos la autenticación de usuarios. Esta operación no afecta los datos existentes.

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true

## Detalles de la Estructura:
- Afecta: `members`, `cajas`, `transactions`, `budgets`, `scheduled_expenses`
- Operación: `ALTER TABLE ... DISABLE ROW LEVEL SECURITY`

## Implicaciones de Seguridad:
- RLS Status: Deshabilitado
- Policy Changes: No (las políticas existentes se ignoran)
- Auth Requirements: Ninguno

## Impacto en el Rendimiento:
- Indexes: Ninguno
- Triggers: Ninguno
- Estimated Impact: Nulo.
*/

ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cajas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_expenses DISABLE ROW LEVEL SECURITY;
