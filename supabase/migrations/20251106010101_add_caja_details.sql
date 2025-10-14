/*
# [ADD_CAJA_DETAILS]
Añade columnas detalladas a la tabla `cajas` para soportar Cuentas Bancarias, Tarjetas de Crédito y Préstamos.

## Query Description:
Esta operación modifica la tabla `cajas` añadiendo varias columnas nuevas. No elimina datos existentes, pero las nuevas columnas estarán vacías (`NULL`) para los registros que ya existen hasta que se actualicen. Es una operación segura que expande la funcionalidad de la aplicación.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (se pueden eliminar las columnas, pero no se recomienda)

## Structure Details:
- **Table:** `public.cajas`
- **Columns Added:**
  - `bank` (text)
  - `alias` (text)
  - `currency` (text)
  - `account_number` (text)
  - `card_number` (text)
  - `credit_line` (numeric)
  - `closing_day` (integer)
  - `payment_due_date` (integer)
  - `loan_purpose` (text)
  - `total_installments` (integer)
  - `paid_installments` (integer)
  - `payment_day` (integer)
  - `monthly_payment` (numeric)

## Security Implications:
- RLS Status: No cambia el estado de RLS.
- Policy Changes: No.
- Auth Requirements: No.

## Performance Impact:
- Indexes: Ninguno.
- Triggers: Ninguno.
- Estimated Impact: Mínimo. El impacto en el rendimiento de las consultas será insignificante.
*/

ALTER TABLE public.cajas
ADD COLUMN IF NOT EXISTS bank TEXT,
ADD COLUMN IF NOT EXISTS alias TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT,
ADD COLUMN IF NOT EXISTS account_number TEXT,
ADD COLUMN IF NOT EXISTS card_number TEXT,
ADD COLUMN IF NOT EXISTS credit_line NUMERIC,
ADD COLUMN IF NOT EXISTS closing_day INTEGER,
ADD COLUMN IF NOT EXISTS payment_due_date INTEGER,
ADD COLUMN IF NOT EXISTS loan_purpose TEXT,
ADD COLUMN IF NOT EXISTS total_installments INTEGER,
ADD COLUMN IF NOT EXISTS paid_installments INTEGER,
ADD COLUMN IF NOT EXISTS payment_day INTEGER,
ADD COLUMN IF NOT EXISTS monthly_payment NUMERIC;
