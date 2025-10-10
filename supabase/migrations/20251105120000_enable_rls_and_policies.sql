/*
# Habilitar Row Level Security (RLS) y Crear Políticas Permisivas Temporales

## Descripción de la Consulta:
Esta migración es un paso de seguridad crítico. Habilita la Seguridad a Nivel de Fila (RLS) en todas las tablas de la aplicación y crea políticas temporales que permiten todo el acceso. Aunque la política es permisiva, habilitar RLS es fundamental para resolver las alertas de seguridad y establecer la base para futuras políticas de autenticación más estrictas (por ejemplo, "un usuario solo puede ver sus propios datos").

## Metadatos:
- Categoría del Esquema: "Seguridad"
- Nivel de Impacto: "Alto"
- Requiere Respaldo: false
- Reversible: true (se puede deshabilitar RLS, pero no es recomendado)

## Detalles de la Estructura:
- Tablas afectadas: members, cajas, transactions, budgets, scheduled_expenses.

## Implicaciones de Seguridad:
- Estado de RLS: Habilitado para todas las tablas.
- Cambios en Políticas: Se añaden políticas permisivas iniciales.
- Requisitos de Autenticación: Ninguno por ahora, pero prepara el terreno para ello.

## Impacto en el Rendimiento:
- Mínimo. RLS tiene un impacto de rendimiento muy bajo.
*/

-- Habilitar RLS para la tabla de miembros
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access for now" ON public.members FOR ALL USING (true) WITH CHECK (true);

-- Habilitar RLS para la tabla de cajas
ALTER TABLE public.cajas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access for now" ON public.cajas FOR ALL USING (true) WITH CHECK (true);

-- Habilitar RLS para la tabla de transacciones
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access for now" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

-- Habilitar RLS para la tabla de presupuestos
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access for now" ON public.budgets FOR ALL USING (true) WITH CHECK (true);

-- Habilitar RLS para la tabla de gastos programados
ALTER TABLE public.scheduled_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access for now" ON public.scheduled_expenses FOR ALL USING (true) WITH CHECK (true);
