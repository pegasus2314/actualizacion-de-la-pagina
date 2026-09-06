# TRD La Regional Esmeralda

Plataforma web independiente para el Torneo Regional de Debate de la Regional 17.

## Arquitectura

- Frontend estático preparado para Vercel.
- Supabase: proyecto `Perrito-IA`, usando exclusivamente el módulo aislado `esmeralda_*`.
- No depende de `Regional17-Voluntarios`.
- No modifica ni reutiliza las tablas existentes de mascota ni el sistema MUN/debate anterior.

## Módulos

- Inicio
- Inscripción de equipos
- Participantes
- Rondas
- Enfrentamientos
- Salas
- Evaluación
- Resultados y ranking
- Administración
- Usuarios y permisos

## Estado

Primera versión funcional del frontend y conexión inicial a Supabase. Siguiente etapa: panel administrativo completo, flujo de aprobación/rechazo, gestión de rondas/enfrentamientos/evaluación y configuración de producción en Vercel.
