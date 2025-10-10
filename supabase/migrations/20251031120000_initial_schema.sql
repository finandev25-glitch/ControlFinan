/*
          # Creación del Esquema Inicial
          Este script establece la estructura fundamental de la base de datos para la aplicación de finanzas familiares.

          ## Query Description: Este script creará todas las tablas necesarias para almacenar miembros, cajas (cuentas), transacciones, presupuestos y gastos programados. No modifica ni elimina datos existentes, ya que está diseñado para la configuración inicial. Es seguro de ejecutar en un proyecto nuevo.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Crea la tabla `members` para los perfiles de la familia.
          - Crea la tabla `cajas` para las cuentas financieras (efectivo, bancos, tarjetas, préstamos).
          - Crea la tabla `transactions` para registrar ingresos y gastos.
          - Crea la tabla `budgets` para los límites de gasto por categoría.
          - Crea la tabla `scheduled_expenses` para los gastos recurrentes.
          - Habilita Row Level Security (RLS) en todas las tablas.
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: No (se crean políticas base).
          - Auth Requirements: Requiere que el usuario esté autenticado para acceder a los datos.
          
          ## Performance Impact:
          - Indexes: Se crean claves primarias y foráneas, lo que optimiza las consultas.
          - Triggers: No se añaden triggers en este script.
          - Estimated Impact: Bajo. La creación de tablas es una operación rápida.
          */

-- 1. Tabla de Miembros
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    avatar TEXT,
    role TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to manage members" ON members
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- 2. Tabla de Cajas (Cuentas Financieras)
CREATE TABLE IF NOT EXISTS cajas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Campos para Cuenta Bancaria
    bank TEXT,
    alias TEXT,
    currency TEXT,
    account_number TEXT,
    
    -- Campos para Tarjeta de Crédito
    card_number_last4 TEXT,
    credit_line NUMERIC,
    closing_day INTEGER,
    payment_due_date INTEGER,
    
    -- Campos para Préstamos
    loan_purpose TEXT,
    total_installments INTEGER,
    paid_installments INTEGER,
    payment_day INTEGER,
    monthly_payment NUMERIC
);

ALTER TABLE cajas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to manage cajas" ON cajas
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- 3. Tabla de Transacciones
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    caja_id UUID NOT NULL REFERENCES cajas(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Ingreso' o 'Gasto'
    category TEXT,
    amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to manage transactions" ON transactions
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- 4. Tabla de Presupuestos
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL UNIQUE,
    limit_amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to manage budgets" ON budgets
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- 5. Tabla de Gastos Programados
CREATE TABLE IF NOT EXISTS scheduled_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT,
    day_of_month INTEGER NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    caja_id UUID REFERENCES cajas(id) ON DELETE SET NULL,
    is_automatic BOOLEAN DEFAULT false,
    is_credit_card_payment BOOLEAN DEFAULT false,
    credit_card_id UUID REFERENCES cajas(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE scheduled_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to manage scheduled expenses" ON scheduled_expenses
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
