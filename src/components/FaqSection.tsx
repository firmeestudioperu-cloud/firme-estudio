import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle, Sparkles, ShieldAlert, HeartPulse, CheckCircle2 } from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'inicio' | 'salud' | 'politicas' | 'estudio';
  question: string;
  answer: string;
  highlight?: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'inicio',
    question: '¿Necesito experiencia previa para tomar clases en FIRME STUDIO?',
    answer: 'En lo absoluto. Todas nuestras sesiones de nivel Principiante y Fundamentos Reformer están diseñadas específicamente para quienes suben por primera vez a un reformer. Tu instructor te guiará en el uso de los resortes, correas y barra de pies con ajustes personalizados desde el minuto uno.',
    highlight: 'Más del 60% de nuestras nuevas alumnas inician sin haber practicado Pilates antes.',
  },
  {
    id: 'faq-2',
    category: 'estudio',
    question: '¿Por qué son obligatorios los calcetines grip antideslizantes?',
    answer: 'Por dos motivos esenciales: seguridad e higiene. La silicona de alto agarre en la planta evita resbalones en la barra de pies metálica y en el carro móvil durante ejercicios de equilibrio. Además, mantiene la superficie de cuero vegano y tapizados impecables para toda la comunidad. Si no dispones de ellos, puedes adquirirlos en nuestra boutique en recepción por S/. 45.',
    highlight: 'Disponibles en recepción en colores Terracota y Arena.',
  },
  {
    id: 'faq-3',
    category: 'salud',
    question: 'Tengo dolor lumbar, hernia o una lesión previa, ¿puedo practicar?',
    answer: 'Sí, el Pilates Reformer es uno de los métodos de movimiento más recomendados por fisioterapeutas y traumatólogos porque el trabajo con resortes elimina el impacto articular y permite una descompresión espinal asistida. Al registrarte en el formulario o llegar al check-in de recepción, indícanos tu diagnóstico en la ficha biomecánica para que el docente adapte los ángulos y resistencias para ti.',
    highlight: 'Nuestros docentes cuentan con formación en biomecánica y rehabilitación postural.',
  },
  {
    id: 'faq-4',
    category: 'politicas',
    question: '¿Cómo funciona la política de cancelación y reprogramación de 12 horas?',
    answer: 'Puedes cancelar o reprogramar tu clase sin costo ni pérdida de crédito hasta con 12 horas de anticipación directa desde la pestaña "Mis Clases". Debido a que nuestras salas son boutique y tienen un aforo estricto de solo 8 camas reformer, cancelaciones con menor aviso consumen el crédito para respetar el tiempo de los profesores y liberar el cupo a personas en lista de espera.',
    highlight: 'Tus créditos cancelados a tiempo regresan instantáneamente a tu cuenta.',
  },
  {
    id: 'faq-5',
    category: 'estudio',
    question: '¿Qué comodidades y facilidades incluye el estudio en San Juan de Lurigancho?',
    answer: 'Disponemos de lockers individuales con combinación, dispensador de agua filtrada de cortesía (¡trae tu tomatodo!), vestidores higiénicos, toallitas de mano esterilizadas y una cuidada ambientación con música sutil y aromaterapia de eucalipto blanco.',
    highlight: 'Solo necesitas traer ropa cómoda, tu botella y muchas ganas de moverte.',
  },
  {
    id: 'faq-6',
    category: 'politicas',
    question: '¿Qué sucede si llego unos minutos tarde a mi sesión?',
    answer: 'Contamos con una tolerancia máxima de 5 minutos. Pasado ese lapso, por motivos de seguridad biomecánica (el calentamiento articular de apertura es indispensable para proteger columna y articulaciones) y para salvaguardar la concentración y el ritmo de la sala, no se permitirá el ingreso.',
    highlight: 'Recomendamos llegar 10 a 15 minutos antes, sobre todo en tu primera visita.',
  },
];

interface FaqSectionProps {
  onOpenWhatsApp?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onOpenWhatsApp }) => {
  const [activeCategory, setActiveCategory] = useState<'todas' | 'inicio' | 'salud' | 'politicas' | 'estudio'>('todas');
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(['faq-1']));

  const toggleFaq = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredFaqs = activeCategory === 'todas'
    ? FAQ_ITEMS
    : FAQ_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <section
      id="faq"
      className="w-full bg-[#FAF8F5] py-16 sm:py-20 lg:py-24 border-b border-[#E4DED4]/60"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#B5654A] block mb-2">
            Preguntas Frecuentes
          </span>
          <h2 className="font-fraunces text-2xl sm:text-3xl md:text-4xl text-[#1A1815] tracking-tight">
            Todo lo que necesitas saber antes de tu clase
          </h2>
          <p className="mt-3 text-[#6B655C] text-sm sm:text-base leading-relaxed">
            Resolvemos tus dudas sobre indumentaria, adaptación a lesiones y funcionamiento de nuestras reservas.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {[
            { key: 'todas', label: 'Todas las preguntas' },
            { key: 'inicio', label: 'Primeros pasos' },
            { key: 'salud', label: 'Dolores & Lesiones' },
            { key: 'politicas', label: 'Cancelaciones & Normas' },
            { key: 'estudio', label: 'Instalaciones & Ropa' },
          ].map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeCategory === cat.key
                  ? 'bg-[#B5654A] text-white shadow-xs'
                  : 'bg-[#F1ECE5] text-[#6B655C] hover:bg-[#E4DED4] hover:text-[#1A1815]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {filteredFaqs.map((faq) => {
            const isOpen = openIds.has(faq.id);
            return (
              <div
                key={faq.id}
                className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-[#FAF8F5] border-[#B5654A]/40 shadow-xs'
                    : 'bg-[#FAF8F5] border-[#E4DED4] hover:border-[#DDD5C9]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-hidden"
                >
                  <span className="font-fraunces text-base sm:text-lg text-[#1A1815] font-medium leading-snug">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-[#B5654A] text-white' : 'bg-[#F1ECE5] text-[#6B655C]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-[#6B655C] leading-relaxed border-t border-[#E4DED4]/50 animate-in fade-in duration-150">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
