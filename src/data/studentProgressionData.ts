import React from 'react';
import {
  Award,
  Crown,
  Layers,
  Activity,
  ShieldCheck,
} from 'lucide-react';

export interface LevelTier {
  level: number;
  romanNumeral: string;
  name: string;
  minExp: number;
  maxExp: number;
  iconComponent: React.ComponentType<{ className?: string }>;
  focus: string;
  perks: string[];
  reward: string;
  rewardTag: string;
}

export const LEVEL_TIERS: LevelTier[] = [
  {
    level: 1,
    romanNumeral: 'I',
    name: 'Fundamentos & Alineación',
    minExp: 0,
    maxExp: 499,
    iconComponent: Layers,
    focus: 'Alineación pélvica neutra, respiración diafragmática y control de resortes de precisión.',
    perks: [
      'Evaluación biomecánica individualizada de bienvenida',
      'Acceso exclusivo a grupos reducidos de máximo 8 alumnos',
      'Diagnóstico inicial de rango articular y postura axial',
    ],
    reward: 'Guía digital de salud postural y biomecánica diaria',
    rewardTag: 'Beneficio Inicial',
  },
  {
    level: 2,
    romanNumeral: 'II',
    name: 'Enfoque & Constancia',
    minExp: 500,
    maxExp: 1499,
    iconComponent: Activity,
    focus: 'Activación del transverso profundo, control del carro y estabilidad lumbopélvica continua.',
    perks: [
      '15% de beneficio en toda la boutique oficial FIRME (calcetines, botellas, brumas)',
      'Ventana de reserva prioritaria con 48 horas de anticipación',
      'Acceso al FIRME PASS digital con registro de asistencia en tiempo real',
    ],
    reward: '15% de cortesía en boutique oficial de Jr. Akapana',
    rewardTag: 'Rango Activo',
  },
  {
    level: 3,
    romanNumeral: 'III',
    name: 'Maestría Reformer',
    minExp: 1500,
    maxExp: 2999,
    iconComponent: Award,
    focus: 'Fluidez en movimientos combinados, coordinación neuromuscular y fortalecimiento dinámico integral.',
    perks: [
      'Invitación a Masterclasses técnicas mensuales con la dirección de estudio',
      'Servicio de toalla de microfibra esterilizada en cada sesión',
      'Prioridad de asignación en lista de espera preferencial',
    ],
    reward: '1 Par de Calcetines Grip Antideslizantes FIRME edición especial en recepción',
    rewardTag: 'Recompensa en Sede',
  },
  {
    level: 4,
    romanNumeral: 'IV',
    name: 'Élite Contrology',
    minExp: 3000,
    maxExp: 4999,
    iconComponent: ShieldCheck,
    focus: 'Dominio de suspensiones en Cadillac, arcos de resistencia pesada y propiocepción avanzada.',
    perks: [
      'Casillero VIP con distinción personalizada en el estudio',
      'Pase de invitado mensual para entrenar con una persona de tu elección',
      'Acceso preferente a seminarios de biomecánica y movilidad funcional',
    ],
    reward: '1 Sesión Privada 1-a-1 personalizada con Director Técnico (Cortesía institucional)',
    rewardTag: 'Sesión Privada VIP',
  },
  {
    level: 5,
    romanNumeral: 'V',
    name: 'Leyenda FIRME',
    minExp: 5000,
    maxExp: 9999,
    iconComponent: Crown,
    focus: 'Hábito de vida consolidado, técnica de precisión y máximo balance biomecánico permanente.',
    perks: [
      '15% de beneficio vitalicio en renovaciones de planes y membresías',
      'Distinción conmemorativa grabada en el mural de honor de Jr. Akapana 1261',
      'Kit boutique anual de cortesía (Calcetines, Botella térmica, Bruma y Tote)',
    ],
    reward: '15% de Beneficio Vitalicio Permanente + Placa Conmemorativa en Estudio',
    rewardTag: 'Distinción Honorífica',
  },
];
