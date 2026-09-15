import React, { useState, useRef, useEffect } from 'react';
import {
  Cat,
  Sparkles,
  MessageSquare,
  X,
  Send,
  Loader2,
  MapPin,
  Calendar,
  Activity,
  ArrowRight,
  ExternalLink,
  Bot,
  User,
} from 'lucide-react';
import { studioApi } from '../services/api';

interface AiAssistantWidgetProps {
  onNavigateToSchedule?: () => void;
  onOpenBiomechanicsQuiz?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionButton?: {
    label: string;
    type: 'schedule' | 'quiz' | 'whatsapp';
  };
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'assistant',
    text: '¡Hola! Soy **Grace IA**, tu asistente inteligente en **FIRME STUDIO** (Sede Jr. Akapana 1261, Lima - SJL). ¿En qué puedo guiarte hoy respecto a nuestras salas de Reformer Allegro 2, reservas o tu primera clase?',
    timestamp: 'Ahora',
  },
];

const SUGGESTED_PROMPTS = [
  '¿Dónde queda el estudio exactamente?',
  '¿Qué necesito para mi 1ra clase?',
  'Tengo molestia lumbar, ¿puedo hacer reformer?',
  '¿Cómo acumulo EXP y subo de nivel?',
  'Hacer Test Biomecánico postural',
];

export const AiAssistantWidget: React.FC<AiAssistantWidgetProps> = ({
  onNavigateToSchedule,
  onOpenBiomechanicsQuiz,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const message = (textToSend || inputText).trim();
    if (!message || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      // Check if user specifically requested quiz
      const lower = message.toLowerCase();
      if (lower.includes('test') || lower.includes('quiz') || lower.includes('biomecanico') || lower.includes('biomecánico')) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `asst-${Date.now()}`,
              sender: 'assistant',
              text: 'Nuestro **Test Biomecánico y Postural** evalúa tus objetivos y molestias para adaptar los resortes y recomendarte el mejor horario. ¡Puedes iniciarlo de inmediato aquí!',
              timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
              actionButton: {
                label: 'Iniciar Test Biomecánico',
                type: 'quiz',
              },
            },
          ]);
          setIsLoading(false);
        }, 500);
        return;
      }

      const history = messages.map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        text: m.text,
      }));

      const res = await studioApi.chatWithStudioAi({
        message,
        history,
      });

      let actionBtn: ChatMessage['actionButton'] = undefined;
      if (lower.includes('reserva') || lower.includes('horario') || lower.includes('turno') || lower.includes('agendar')) {
        actionBtn = { label: 'Ver Cartelera de Horarios', type: 'schedule' };
      } else if (lower.includes('dolor') || lower.includes('espalda') || lower.includes('postura')) {
        actionBtn = { label: 'Realizar Test Biomecánico', type: 'quiz' };
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: res.reply || '¡Con gusto te asesoramos! Puedes acercarte a nuestra recepción en Jr. Akapana 1261 o escribirnos por WhatsApp.',
          timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          actionButton: actionBtn,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Estamos ubicados en **Jr. Akapana 1261, San Juan de Lurigancho (Lima - SJL)**. Operamos de lunes a sábado desde las 06:30 AM con 8 camas Reformer Allegro 2. ¡Escríbenos al WhatsApp +51 984 123 456 para atención inmediata!',
          timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          actionButton: { label: 'Contactar por WhatsApp', type: 'whatsapp' },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormattedText = (text: string) => {
    // Basic bold parsing
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-[#1A1815]">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Circular Floating Trigger Button (Grace IA - Solo Icono Gato con Animación de Flotación) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 animate-float-subtle select-none">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-[#1A1815] hover:bg-[#B5654A] text-[#FAF8F5] shadow-[0_10px_30px_rgba(26,24,21,0.4)] hover:shadow-[0_12px_35px_rgba(181,101,74,0.5)] border-2 border-[#B5654A]/50 hover:border-[#FAF8F5]/80 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
            title="Grace IA"
            aria-label="Grace IA"
          >
            {/* Ícono de Gato */}
            <div className="relative flex items-center justify-center">
              <Cat className="w-7 h-7 sm:w-8 sm:h-8 text-[#FAF8F5] group-hover:scale-105 transition-transform" strokeWidth={1.8} />
              
              {/* Destello mágico */}
              <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1 group-hover:rotate-12 transition-transform" />
            </div>

            {/* Punto de estado en línea con efecto ping */}
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5 -mt-0.5 -mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#1A1815]" />
            </span>
          </button>
        </div>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] h-[540px] max-h-[85vh] bg-[#FAF8F5] border border-[#E4DED4] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-[#1A1815] text-[#FAF8F5] p-4 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#B5654A] flex items-center justify-center text-white shadow-xs">
                <Cat className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-fraunces text-sm font-semibold tracking-wide">
                    Grace IA
                  </h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10px] text-white/60 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-[#B5654A]" />
                  <span>Jr. Akapana 1261 · Lima-SJL</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-[#F7F4EE]/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-[#B5654A]/20 text-[#B5654A] flex items-center justify-center shrink-0 mt-0.5">
                    <Cat className="w-4 h-4" strokeWidth={2} />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3 shadow-2xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#1A1815] text-[#FAF8F5] rounded-br-xs'
                      : 'bg-white text-[#4A453E] border border-[#E4DED4] rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line text-xs">{renderFormattedText(msg.text)}</p>

                  {/* Optional Action Button */}
                  {msg.actionButton && (
                    <div className="mt-2.5 pt-2 border-t border-[#E4DED4]/60">
                      {msg.actionButton.type === 'schedule' && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            onNavigateToSchedule?.();
                          }}
                          className="w-full py-1.5 px-2.5 bg-[#B5654A] hover:bg-[#9A5340] text-white rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>{msg.actionButton.label}</span>
                        </button>
                      )}

                      {msg.actionButton.type === 'quiz' && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            onOpenBiomechanicsQuiz?.();
                          }}
                          className="w-full py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Activity className="w-3 h-3" />
                          <span>{msg.actionButton.label}</span>
                        </button>
                      )}

                      {msg.actionButton.type === 'whatsapp' && (
                        <a
                          href="https://wa.me/51984123456?text=Hola%20FIRME%20STUDIO%2C%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20sobre%20las%20clases%20en%20SJL"
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>{msg.actionButton.label}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}

                  <span
                    className={`text-[9px] block text-right mt-1 ${
                      msg.sender === 'user' ? 'text-white/50' : 'text-[#8C8479]'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-xs text-[#6B655C]">
                <div className="w-6 h-6 rounded-full bg-[#B5654A]/10 text-[#B5654A] flex items-center justify-center shrink-0">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span className="italic text-[11px]">Consultando a Grace IA...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-white border-t border-[#E4DED4] overflow-x-auto flex gap-1.5 shrink-0 no-scrollbar">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap text-[10px] px-2.5 py-1 rounded-full bg-[#F1ECE5] hover:bg-[#B5654A] hover:text-white text-[#6B655C] transition-colors border border-[#E4DED4] cursor-pointer shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-[#E4DED4] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe tu consulta sobre clases, postura..."
              disabled={isLoading}
              className="flex-1 bg-[#FAF8F5] border border-[#E4DED4] rounded-xl px-3 py-2 text-xs text-[#1A1815] focus:outline-none focus:border-[#B5654A]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2 bg-[#B5654A] hover:bg-[#9A5340] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
