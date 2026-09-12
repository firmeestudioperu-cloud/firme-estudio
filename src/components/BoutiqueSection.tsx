import React, { useState } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  Star,
  QrCode,
  Copy,
  CheckCircle2,
  X,
  Smartphone,
  CreditCard,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: string;
  priceNum: number;
  expCost: number;
  description: string;
  image: string;
  tag?: string;
  features: string[];
  variants?: {
    name: string;
    options: string[];
  };
}

const BOUTIQUE_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-socks',
    name: 'Calcetines Grip Antideslizantes FIRME',
    category: 'Indispensable en Sala',
    price: 'S/. 45',
    priceNum: 45,
    expCost: 450,
    description: 'Puntos de agarre de silicona en toda la planta para máxima estabilidad y tracción en la barra de pies y el carro del reformer Allegro 2.',
    image: '/assets/grip-socks.jpg',
    tag: 'Obligatorio en sala',
    features: ['Algodón orgánico respirable', 'Suela de agarre de alta tracción', 'Banda elástica de soporte de arco'],
    variants: {
      name: 'Talla y Color',
      options: ['Talla S (35-37) · Terracota', 'Talla M (38-40) · Terracota', 'Talla M (38-40) · Arena Lino', 'Talla L (41-43) · Negro Carbón'],
    },
  },
  {
    id: 'prod-bottle',
    name: 'Botella Térmica Matte Inox (650 ml)',
    category: 'Hidratación & Bienestar',
    price: 'S/. 55',
    priceNum: 55,
    expCost: 550,
    description: 'Mantiene el agua fría por 24 horas. Acabado mate sedoso antideslizante con grabado láser del isotipo FIRME STUDIO.',
    image: '/assets/thermal-bottle.jpg',
    tag: 'Edición Limitada',
    features: ['Acero inoxidable 18/8 doble pared', 'Libre de BPA y condensación', 'Tapa con sellado hermético al vacío'],
    variants: {
      name: 'Color Acabado',
      options: ['Negro Matte Signature', 'Blanco Crema Orgánico', 'Terracota Cálido'],
    },
  },
  {
    id: 'prod-mist',
    name: 'Bruma Aromática Relajante (100 ml)',
    category: 'Firma Olfativa del Estudio',
    price: 'S/. 38',
    priceNum: 38,
    expCost: 380,
    description: 'Aceites esenciales puros de eucalipto blanco, lavanda francesa y bergamota. La misma firma olfativa botánica que aromatiza nuestras salas de reformer.',
    image: '/assets/aroma-mist.jpg',
    features: ['100% extractos botánicos naturales', 'Para rociar en toallas, ropa o almohada', 'Efecto descongestivo y relajante neuromuscular'],
    variants: {
      name: 'Presentación',
      options: ['Eucalipto & Lavanda (Relajante)', 'Bergamota & Cedro (Vitalidad)'],
    },
  },
  {
    id: 'prod-tote',
    name: 'Tote Bag Lino Orgánico FIRME',
    category: 'Lifestyle Boutique',
    price: 'S/. 35',
    priceNum: 35,
    expCost: 350,
    description: 'Bolso amplio de lino orgánico crudo con serigrafía minimalista. Diseñado para llevar calcetines, toalla, botella térmica y tus pertenencias a la sesión.',
    image: '/assets/tote-bag.jpg',
    features: ['Lino 100% biodegradable premium', 'Costuras reforzadas para alta carga', 'Bolsillo interior con cremallera'],
    variants: {
      name: 'Tonalidad',
      options: ['Lino Crudo Natural', 'Grafito Minimalista'],
    },
  },
];

interface BoutiqueSectionProps {
  userExp?: number;
  onRedeemWithExp?: (productName: string, expCost: number) => boolean;
  onNotifyProduct?: (productName: string) => void;
}

export const BoutiqueSection: React.FC<BoutiqueSectionProps> = ({
  userExp = 1350,
  onRedeemWithExp,
  onNotifyProduct,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'efectivo' | 'exp'>('efectivo');
  const [voucherData, setVoucherData] = useState<{
    code: string;
    productName: string;
    variant: string;
    mode: 'efectivo' | 'exp';
    costText: string;
    date: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleOpenOrder = (product: ProductItem) => {
    setSelectedProduct(product);
    setSelectedVariant(product.variants?.options[0] || 'Estándar');
    setPaymentMode('efectivo');
    setVoucherData(null);
    setCopiedCode(false);
  };

  const handleConfirmOrder = () => {
    if (!selectedProduct) return;

    if (paymentMode === 'exp') {
      if (onRedeemWithExp) {
        const success = onRedeemWithExp(selectedProduct.name, selectedProduct.expCost);
        if (!success) {
          return;
        }
      }
    } else {
      if (onNotifyProduct) {
        onNotifyProduct(selectedProduct.name);
      }
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `VCH-${paymentMode === 'exp' ? 'EXP' : 'SJL'}-${randomSuffix}`;
    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString('es-PE')} · ${now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;

    setVoucherData({
      code,
      productName: selectedProduct.name,
      variant: selectedVariant,
      mode: paymentMode,
      costText: paymentMode === 'exp' ? `${selectedProduct.expCost} EXP (Canjeado)` : `${selectedProduct.price} (Pagar en recepción)`,
      date: dateFormatted,
    });
  };

  const handleCopyVoucher = () => {
    if (voucherData) {
      navigator.clipboard.writeText(voucherData.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return (
    <section
      id="boutique"
      className="w-full bg-[#FAF8F5] py-16 sm:py-20 lg:py-24 border-b border-[#E4DED4]/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-4">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-widest uppercase text-[#B5654A] block mb-2">
              Boutique Oficial & Canje de Recompensas
            </span>
            <h2 className="font-fraunces text-2xl sm:text-3xl md:text-4xl text-[#1A1815] tracking-tight">
              Diseño, seguridad y bienestar para tu práctica
            </h2>
            <p className="mt-3 text-[#6B655C] text-sm sm:text-base leading-relaxed">
              Equipamiento técnico oficial para tu sesión en el Reformer Allegro 2. Adquiérelos con pago directo en recepción (Yape / Tarjeta) o <strong>canjéalos con tus puntos de experiencia EXP</strong> ganados por asistir a clases.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-[#6B655C] bg-[#F1ECE5] px-3.5 py-2 rounded-lg border border-[#E4DED4]">
              <MapPin className="w-3.5 h-3.5 text-[#B5654A]" />
              <span>Retiro en recepción: <strong>Jr. Akapana 1261, SJL</strong></span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#B5654A] bg-[#B5654A]/10 px-3 py-2 rounded-lg border border-[#B5654A]/20 font-medium">
              <Star className="w-3.5 h-3.5 fill-[#B5654A]" />
              <span>Tu Saldo: <strong>{userExp.toLocaleString()} EXP</strong></span>
            </div>
          </div>
        </div>

        {/* 4 Products Grid (Editorial clean presentation) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {BOUTIQUE_PRODUCTS.map((prod) => {
            return (
              <div
                key={prod.id}
                className="bg-[#FAF8F5] border border-[#E4DED4] rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-[#B5654A]/50 hover:shadow-sm group"
              >
                <div>
                  {/* Product Image Frame */}
                  <div className="w-full aspect-square bg-[#E4DED4] overflow-hidden relative">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    {prod.tag && (
                      <div className="absolute top-2.5 left-2.5 bg-[#B5654A] text-[#FAF8F5] text-[9px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md">
                        {prod.tag}
                      </div>
                    )}
                  </div>

                  {/* Product Info (Minimal) */}
                  <div className="p-3.5 sm:p-5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B5654A] block mb-1">
                      {prod.category}
                    </span>
                    <h3 className="font-fraunces text-sm sm:text-base text-[#1A1815] font-medium leading-snug line-clamp-2">
                      {prod.name}
                    </h3>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="p-3.5 sm:p-5 pt-0 border-t border-[#E4DED4]/60 mt-auto">
                  <div className="flex items-center justify-between gap-2 pt-3">
                    <div>
                      <span className="font-fraunces text-base sm:text-lg font-bold text-[#1A1815]">
                        {prod.price}
                      </span>
                      <span className="block text-[10px] sm:text-[11px] text-[#B5654A] font-medium">
                        ó {prod.expCost} EXP
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenOrder(prod)}
                      className="bg-[#1A1815] hover:bg-[#B5654A] text-[#FAF8F5] text-xs font-medium px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Adquirir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Pedido / Canje con EXP */}
      {selectedProduct && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1815]/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-[#FAF8F5] rounded-2xl border border-[#E4DED4] p-6 sm:p-7 max-w-lg w-full shadow-2xl relative text-[#1A1815] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!voucherData ? (
              <div className="space-y-5">
                <div>
                  <span className="text-xs font-semibold tracking-widest uppercase text-[#B5654A] block mb-1">
                    FIRME Boutique · Sede Jr. Akapana 1261
                  </span>
                  <h3 className="font-fraunces text-2xl text-[#1A1815]">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-xs text-[#6B655C] mt-1">
                    {selectedProduct.category} · Retiro directo en recepción del estudio.
                  </p>
                </div>

                {/* Product Preview */}
                <div className="flex gap-3.5 items-center p-3 bg-[#F1ECE5] rounded-xl border border-[#E4DED4]">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-16 h-16 rounded-lg object-cover border border-[#E4DED4]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1A1815] truncate">
                      {selectedProduct.name}
                    </p>
                    <p className="text-[11px] text-[#6B655C] mt-0.5 line-clamp-1">
                      {selectedProduct.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-[#1A1815]">
                        {selectedProduct.price}
                      </span>
                      <span className="text-[11px] font-semibold text-[#B5654A]">
                        ó {selectedProduct.expCost} EXP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Variant Selector */}
                {selectedProduct.variants && (
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1815] mb-1.5">
                      Selecciona {selectedProduct.variants.name}:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedProduct.variants.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSelectedVariant(opt)}
                          className={`px-3 py-2 rounded-lg text-xs text-left border transition-all cursor-pointer ${
                            selectedVariant === opt
                              ? 'bg-[#1A1815] text-white border-[#1A1815] shadow-xs'
                              : 'bg-[#F1ECE5] text-[#1A1815] border-[#E4DED4] hover:border-[#B5654A]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{opt}</span>
                            {selectedVariant === opt && <Check className="w-3.5 h-3.5 text-amber-300" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Option Tabs */}
                <div>
                  <label className="block text-xs font-semibold text-[#1A1815] mb-2">
                    Modalidad de Adquisición:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Mode 1: Cash / Yape */}
                    <button
                      type="button"
                      onClick={() => setPaymentMode('efectivo')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        paymentMode === 'efectivo'
                          ? 'border-[#B5654A] bg-[#B5654A]/5 ring-2 ring-[#B5654A]/30'
                          : 'border-[#E4DED4] bg-[#FAF8F5] hover:border-[#6B655C]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="w-4 h-4 text-[#B5654A]" />
                        <span className="text-xs font-bold text-[#1A1815]">Pagar en Soles</span>
                      </div>
                      <p className="text-[11px] text-[#6B655C] leading-snug">
                        {selectedProduct.price} · Vía Yape, Plin o tarjeta en el local.
                      </p>
                    </button>

                    {/* Mode 2: EXP Points */}
                    <button
                      type="button"
                      onClick={() => setPaymentMode('exp')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        paymentMode === 'exp'
                          ? 'border-[#B5654A] bg-[#B5654A]/5 ring-2 ring-[#B5654A]/30'
                          : 'border-[#E4DED4] bg-[#FAF8F5] hover:border-[#6B655C]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span className="text-xs font-bold text-[#1A1815]">Canjear con EXP</span>
                      </div>
                      <p className="text-[11px] text-[#6B655C] leading-snug">
                        {selectedProduct.expCost} EXP · Saldo: {userExp.toLocaleString()} EXP
                      </p>
                    </button>
                  </div>
                </div>

                {/* Details info banner */}
                {paymentMode === 'efectivo' ? (
                  <div className="bg-[#F1ECE5] p-3.5 rounded-xl border border-[#E4DED4] text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#6B655C]">Total a abonar:</span>
                      <span className="font-bold text-sm text-[#1A1815]">{selectedProduct.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B655C]">Punto de entrega:</span>
                      <span className="font-medium text-[#1A1815]">Recepción · Jr. Akapana 1261, SJL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B655C]">Yape / Plin oficial:</span>
                      <span className="text-[#B5654A] font-bold">+51 984 123 456 (FIRME STUDIO)</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-xs space-y-1.5 text-[#1A1815]">
                    <div className="flex justify-between items-center">
                      <span className="text-[#6B655C]">Costo del producto:</span>
                      <span className="font-bold text-amber-700">{selectedProduct.expCost} EXP</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#6B655C]">Tu saldo acumulado:</span>
                      <span className="font-bold text-[#1A1815]">{userExp.toLocaleString()} EXP</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-amber-500/20 pt-1.5">
                      <span className="text-[#6B655C]">Saldo posterior:</span>
                      <span className="font-bold text-emerald-700">
                        {userExp >= selectedProduct.expCost
                          ? `${(userExp - selectedProduct.expCost).toLocaleString()} EXP`
                          : 'Saldo insuficiente'}
                      </span>
                    </div>
                    {userExp < selectedProduct.expCost && (
                      <p className="text-[11px] text-rose-600 font-medium pt-1">
                        ⚠️ Te faltan {(selectedProduct.expCost - userExp).toLocaleString()} EXP. Cada clase completada te suma +150 EXP.
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="w-1/3 py-2.5 rounded-xl border border-[#E4DED4] text-xs font-semibold text-[#6B655C] hover:bg-[#F1ECE5] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    disabled={paymentMode === 'exp' && userExp < selectedProduct.expCost}
                    className="w-2/3 py-2.5 bg-[#B5654A] hover:bg-[#9A5340] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {paymentMode === 'exp' ? `Canjear por ${selectedProduct.expCost} EXP` : 'Confirmar y Generar Vale'}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* Voucher Screen */
              <div className="space-y-5 animate-in zoom-in-95 duration-200">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2.5">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#B5654A] block">
                    {voucherData.mode === 'exp' ? '¡Recompensa Canjeada Exitosamente!' : '¡Reserva Registrada en Recepción!'}
                  </span>
                  <h3 className="font-fraunces text-2xl text-[#1A1815]">
                    Vale de Retiro de Boutique
                  </h3>
                  <p className="text-xs text-[#6B655C] max-w-xs mx-auto mt-1">
                    Presenta este código en la recepción de <strong>FIRME STUDIO SJL</strong> antes o después de tu sesión.
                  </p>
                </div>

                {/* Luxury Voucher Card */}
                <div className="bg-[#1A1815] text-[#FAF8F5] p-5 rounded-2xl border border-amber-900/30 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#B5654A]/20 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                    <div>
                      <p className="text-[10px] tracking-widest uppercase font-semibold text-[#B5654A]">
                        FIRME STUDIO · PILATES
                      </p>
                      <p className="text-xs text-white/70">Jr. Akapana 1261, Lima - SJL</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#B5654A] text-white">
                      {voucherData.mode === 'exp' ? 'Canje EXP' : 'Pago en Local'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="text-[10px] text-white/50 uppercase tracking-wider block">Artículo:</span>
                      <p className="font-fraunces text-base font-medium text-white">{voucherData.productName}</p>
                      <p className="text-xs text-[#B5654A]">{voucherData.variant}</p>
                    </div>

                    <div className="flex justify-between pt-1 border-t border-white/10 text-xs">
                      <div>
                        <span className="text-[10px] text-white/50 block">Modalidad:</span>
                        <span className="font-semibold text-emerald-400">{voucherData.costText}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-white/50 block">Emitido:</span>
                        <span className="text-white/70">{voucherData.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Code Barcode simulation */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-white/50 uppercase tracking-widest block">Código de Retiro:</span>
                      <span className="font-mono font-extrabold text-amber-300 text-lg tracking-wider">
                        {voucherData.code}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyVoucher}
                      className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/51984123456?text=${encodeURIComponent(
                      `Hola FIRME STUDIO, he generado el vale ${voucherData.code} para retirar ${voucherData.productName} (${voucherData.variant}) en el local de Jr. Akapana 1261. ¿Tienen el stock listo para mi próxima clase?`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>Avisar por WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="w-1/2 py-2.5 bg-[#1A1815] hover:bg-[#332F2A] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
