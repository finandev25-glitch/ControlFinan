--
-- categories
--
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    icon_name TEXT NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow all access for anon users" ON public.categories FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE public.categories IS 'Stores user-defined income and expense categories.';

-- Insert initial data
INSERT INTO public.categories (name, type, icon_name) VALUES
('Alimentación', 'expense', 'ShoppingBasket'),
('Transporte', 'expense', 'Car'),
('Vivienda', 'expense', 'Home'),
('Ocio', 'expense', 'Smile'),
('Salud', 'expense', 'HeartPulse'),
('Educación', 'expense', 'GraduationCap'),
('Servicios', 'expense', 'Home'),
('Suscripciones', 'expense', 'Smile'),
('Otros', 'expense', 'MoreHorizontal'),
('Nómina', 'income', 'Briefcase'),
('Beneficios', 'income', 'Landmark'),
('Ventas', 'income', 'TrendingUp'),
('Regalo', 'income', 'Gift');
