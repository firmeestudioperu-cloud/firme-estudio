import React, { useState, useMemo } from 'react';
import {
  Coffee,
  Sparkles,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Tag,
  ShoppingBag,
  CreditCard,
  User,
  MapPin,
  Clock,
  Check,
  X,
  Flame,
  Zap,
  Leaf,
  Filter,
} from 'lucide-react';
import {
  HealthyBarProduct,
  HealthyBarCategory,
  DietaryTag,
  StudentConsumptionRecord,
  HEALTHY_BAR_CATEGORIES,
  INITIAL_HEALTHY_BAR_PRODUCTS,
  INITIAL_CONSUMPTION_HISTORY,
} from '../../data/healthyBarData';
import { ClientProfile, StudioRoom, DEFAULT_STUDIO_ROOMS } from '../../types';

interface HealthyBarSectionProps {
  clients: ClientProfile[];
  selectedRoomId?: string;
  selectedClient?: ClientProfile | null;
  onChargeSuccess?: (record: StudentConsumptionRecord) => void;
}

interface CartItem {
  product: HealthyBarProduct;
  quantity: number;
}

export const HealthyBarSection: React.FC<HealthyBarSectionProps> = ({
  clients = [],
  selectedRoomId = 'sala-1',
  selectedClient = null,
  onChargeSuccess,
}) => {
  const [products, setProducts] = useState<HealthyBarProduct[]>(() => {
    const saved = localStorage.getItem('firme_healthy_bar_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_HEALTHY_BAR_PRODUCTS;
      }
    }
    return INITIAL_HEALTHY_BAR_PRODUCTS;
  });

  const [consumptionHistory, setConsumptionHistory] = useState<StudentConsumptionRecord[]>(() => {
    const saved = localStorage.getItem('firme_healthy_bar_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_CONSUMPTION_HISTORY;
      }
    }
    return INITIAL_CONSUMPTION_HISTORY;
  });

  const [activeCategory, setActiveCategory] = useState<HealthyBarCategory>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<DietaryTag | 'todos'>('todos');
  const [activeView, setActiveView] = useState<'catalogo' | 'historial'>('catalogo');

  // Carrito de pedido en recepción
  const [cart, setCart] = useState<CartItem[]>([]);
  const [targetDni, setTargetDni] = useState<string>(selectedClient?.dni || '');
  const [targetRoomId, setTargetRoomId] = useState<string>(selectedRoomId);
  const [paymentMethod, setPaymentMethod] = useState<'cuenta_interna' | 'yape' | 'pos' | 'efectivo'>('cuenta_interna');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Sincronizar targetDni cuando cambia selectedClient desde afuera
  React.useEffect(() => {
    if (selectedClient?.dni) {
      setTargetDni(selectedClient.dni);
    }
  }, [selectedClient]);

  // Persistir cambios de productos o historial
  const saveProducts = (updated: HealthyBarProduct[]) => {
    setProducts(updated);
    localStorage.setItem('firme_healthy_bar_products', JSON.stringify(updated));
  };

  const saveHistory = (updated: StudentConsumptionRecord[]) => {
    setConsumptionHistory(updated);
    localStorage.setItem('firme_healthy_bar_history', JSON.stringify(updated));
  };

  // Alumna seleccionada para el pedido
  const currentStudent = useMemo(() => {
    if (!targetDni) return null;
    return clients.find((c) => c && c.dni === targetDni.trim()) || null;
  }, [targetDni, clients]);

  // Descuento por membresía
  const membershipDiscountPercent = useMemo(() => {
    if (!currentStudent) return 0;
    const plan = currentStudent.currentPlan?.toLowerCase() || '';
    if (plan.includes('ilimitad') || plan.includes('vip') || plan.includes('anual')) {
      return 15; // 15% descuento a socias ilimitadas
    }
    if (plan.includes('pack 12') || plan.includes('pack 20')) {
      return 10; // 10% a packs grandes
    }
    return 5; // 5% a toda alumna registrada
  }, [currentStudent]);

  // Productos filtrados
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = activeCategory === 'todos' || p.category === activeCategory;
      const matchQuery =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTag = selectedTagFilter === 'todos' || p.dietaryTags.includes(selectedTagFilter);
      return matchCategory && matchQuery && matchTag;
    });
  }, [products, activeCategory, searchQuery, selectedTagFilter]);

  // Totales del carrito
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return Number(((cartSubtotal * membershipDiscountPercent) / 100).toFixed(2));
  }, [cartSubtotal, membershipDiscountPercent]);

  const finalTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - discountAmount);
  }, [cartSubtotal, discountAmount]);

  const handleAddToCart = (product: HealthyBarProduct) => {
    if (!product.isAvailable || product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + 1) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleToggleStock = (productId: string) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        return { ...p, isAvailable: !p.isAvailable };
      }
      return p;
    });
    saveProducts(updated);
  };

  // Procesar pedido y despacho
  const handleConfirmOrder = () => {
    if (cart.length === 0) return;
    if (!targetDni.trim()) {
      alert('Por favor selecciona o ingresa el DNI de la alumna para asociar el pedido.');
      return;
    }

    const clientName = currentStudent?.name || `Alumna DNI ${targetDni}`;
    const room = DEFAULT_STUDIO_ROOMS.find((r) => r.id === targetRoomId) || DEFAULT_STUDIO_ROOMS[0];

    const newRecord: StudentConsumptionRecord = {
      id: `cons-${Date.now()}`,
      clientDni: targetDni.trim(),
      clientName,
      roomId: room.id,
      roomName: room.name,
      items: cart.map((c) => ({
        productId: c.product.id,
        productName: c.product.name,
        quantity: c.quantity,
        unitPrice: c.product.price,
        subtotal: c.product.price * c.quantity,
      })),
      totalAmount: cartSubtotal,
      discountApplied: discountAmount,
      finalAmount: finalTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'cuenta_interna' ? 'pendiente_en_cuenta' : 'pagado',
      createdAt: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    };

    // Descontar inventario
    const updatedProducts = products.map((p) => {
      const cartItem = cart.find((c) => c.product.id === p.id);
      if (cartItem) {
        const newStock = Math.max(0, p.stock - cartItem.quantity);
        return {
          ...p,
          stock: newStock,
          isAvailable: newStock > 0 ? p.isAvailable : false,
        };
      }
      return p;
    });
    saveProducts(updatedProducts);

    const updatedHistory = [newRecord, ...consumptionHistory];
    saveHistory(updatedHistory);

    onChargeSuccess?.(newRecord);
    setCart([]);
    setSuccessToast(`¡Pedido despachado con éxito para ${clientName}! Total: S/ ${finalTotal.toFixed(2)}`);
    setTimeout(() => setSuccessToast(null), 4500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast de Éxito */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-900 text-sm shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="p-1 text-emerald-600 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cabecera de la Sección Café & Bienestar */}
      <div className="bg-white rounded-3xl border border-[#E4DED4] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF2E8] border border-[#B5654A]/30 flex items-center justify-center text-[#B5654A] shadow-xs">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-fraunces text-xl sm:text-2xl font-bold text-[#1A1815]">
                Café & Bienestar · Healthy Bar
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#B5654A] text-white">
                Boutique Pilates
              </span>
            </div>
            <p className="text-xs text-[#6B655C] mt-0.5">
              Nutrición consciente para alumnas: batidos proteicos, jugos detox, café de especialidad y snacks.
            </p>
          </div>
        </div>

        {/* Selector de Vista: Catálogo vs Historial */}
        <div className="flex items-center gap-2 bg-[#FAF8F5] p-1.5 rounded-2xl border border-[#E4DED4]">
          <button
            type="button"
            onClick={() => setActiveView('catalogo')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'catalogo'
                ? 'bg-[#1A1815] text-white shadow-xs'
                : 'text-[#6B655C] hover:text-[#1A1815]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Menú & Pedidos</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('historial')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'historial'
                ? 'bg-[#1A1815] text-white shadow-xs'
                : 'text-[#6B655C] hover:text-[#1A1815]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Historial ({consumptionHistory.length})</span>
          </button>
        </div>
      </div>

      {activeView === 'catalogo' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda / Central: Catálogo de Productos */}
          <div className="lg:col-span-2 space-y-5">
            {/* Buscador y Filtros Dietarios */}
            <div className="bg-white rounded-2xl border border-[#E4DED4] p-4 shadow-xs space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#AFA79C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, ingrediente o alérgeno..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#DDD5C9] bg-[#FAF8F5] text-[#1A1815] focus:outline-none focus:ring-2 focus:ring-[#B5654A]"
                />
              </div>

              {/* Filtros rápidos de Etiquetas Dietarias */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] font-semibold text-[#6B655C] mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-[#B5654A]" /> Dieta:
                </span>
                {(['todos', 'vegano', 'sin_azucar', 'sin_gluten', 'proteico', 'keto'] as const).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTagFilter(tag)}
                    className={`px-2.5 py-1 rounded-lg font-medium text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                      selectedTagFilter === tag
                        ? 'bg-[#B5654A] text-white'
                        : 'bg-[#F1ECE5] text-[#6B655C] hover:text-[#1A1815]'
                    }`}
                  >
                    {tag === 'todos' ? 'Todas' : tag.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Carrusel / Botonera de Categorías */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {HEALTHY_BAR_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer border ${
                    activeCategory === cat.id
                      ? 'bg-[#B5654A] border-[#B5654A] text-white shadow-xs'
                      : 'bg-white border-[#E4DED4] text-[#6B655C] hover:border-[#B5654A] hover:text-[#1A1815]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Grilla de Tarjetas de Productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map((p) => {
                const isOutOfStock = !p.isAvailable || p.stock <= 0;
                return (
                  <div
                    key={p.id}
                    className={`bg-white rounded-2xl border border-[#E4DED4] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
                      isOutOfStock ? 'opacity-65' : ''
                    }`}
                  >
                    <div>
                      {/* Imagen con Badges */}
                      <div className="relative h-36 w-full overflow-hidden bg-zinc-100">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                          {p.dietaryTags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[#1A1815] shadow-xs"
                            >
                              {tag.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                        <div className="absolute top-2.5 right-2.5">
                          <button
                            type="button"
                            onClick={() => handleToggleStock(p.id)}
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs cursor-pointer ${
                              isOutOfStock
                                ? 'bg-rose-600 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}
                            title="Cambiar disponibilidad"
                          >
                            {isOutOfStock ? 'Agotado' : `Stock: ${p.stock}`}
                          </button>
                        </div>
                      </div>

                      {/* Info del Producto */}
                      <div className="p-4 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-fraunces text-base font-bold text-[#1A1815] leading-tight">
                            {p.name}
                          </h3>
                          <span className="font-bold font-fraunces text-sm text-[#B5654A] shrink-0">
                            S/ {p.price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B655C] line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>

                        {/* Calorías / Proteína / Alérgenos */}
                        <div className="pt-2 flex items-center justify-between text-[10px] text-[#6B655C] border-t border-[#F1ECE5]">
                          <div className="flex items-center gap-2">
                            {p.calories !== undefined && (
                              <span className="flex items-center gap-0.5">
                                <Flame className="w-3 h-3 text-amber-600" /> {p.calories} kcal
                              </span>
                            )}
                            {p.proteinGrams !== undefined && (
                              <span className="flex items-center gap-0.5">
                                <Zap className="w-3 h-3 text-[#B5654A]" /> {p.proteinGrams}g prot
                              </span>
                            )}
                          </div>
                          {p.allergens.length > 0 && (
                            <span className="text-amber-800 font-medium truncate max-w-[120px]">
                              Contiene: {p.allergens.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botón Añadir */}
                    <div className="p-4 pt-0">
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => handleAddToCart(p)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isOutOfStock
                            ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                            : 'bg-[#FAF2E8] hover:bg-[#B5654A] text-[#B5654A] hover:text-white border border-[#B5654A]/30'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isOutOfStock ? 'Producto Agotado' : 'Agregar al Pedido'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Columna Derecha: Orden y Despacho para Alumna */}
          <div className="space-y-5">
            <div className="bg-white rounded-3xl border-2 border-[#E4DED4] p-5 shadow-sm space-y-4 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1ECE5]">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#B5654A]" />
                  <h3 className="font-fraunces text-lg font-bold text-[#1A1815]">
                    Pedido de Alumna
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FAF2E8] text-[#B5654A]">
                  {cart.reduce((s, i) => s + i.quantity, 0)} items
                </span>
              </div>

              {/* Asignación de Alumna por DNI */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B655C]">
                  Alumna que Consume
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#AFA79C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="DNI de la alumna (ej. 70112233)"
                    value={targetDni}
                    onChange={(e) => setTargetDni(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-[#DDD5C9] bg-[#FAF8F5] text-[#1A1815] focus:outline-none focus:ring-2 focus:ring-[#B5654A]"
                  />
                </div>
                {currentStudent ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1 animate-in fade-in">
                    <div className="font-bold flex items-center justify-between">
                      <span>{currentStudent.name}</span>
                      <span className="text-[10px] bg-emerald-200 px-1.5 py-0.5 rounded">
                        {currentStudent.currentPlan}
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-700 flex items-center justify-between">
                      <span>Beneficio de Membresía:</span>
                      <span className="font-bold">-{membershipDiscountPercent}% OFF en Healthy Bar</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-[#AFA79C]">
                    Si la alumna está en sala, digita su DNI para aplicar beneficios.
                  </p>
                )}
              </div>

              {/* Selector de Sala */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B655C]">
                  Sala de Despacho
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DEFAULT_STUDIO_ROOMS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setTargetRoomId(r.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                        targetRoomId === r.id
                          ? 'bg-[#1A1815] border-[#1A1815] text-white shadow-xs'
                          : 'bg-[#FAF8F5] border-[#E4DED4] text-[#6B655C] hover:border-[#B5654A]'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{r.name.replace(' (Pilates)', '')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de Items en Carrito */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#AFA79C] border border-dashed border-[#E4DED4] rounded-2xl">
                    <Coffee className="w-6 h-6 mx-auto mb-1 text-[#DDD5C9]" />
                    <span>No hay productos en el pedido</span>
                  </div>
                ) : (
                  cart.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="p-2.5 bg-[#FAF8F5] border border-[#E4DED4] rounded-xl flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#1A1815] truncate">
                          {product.name}
                        </div>
                        <div className="text-[10px] text-[#6B655C]">
                          S/ {product.price.toFixed(2)} c/u
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(product.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white border border-[#DDD5C9] flex items-center justify-center text-[#1A1815] hover:bg-zinc-100 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(product.id, 1)}
                          className="w-6 h-6 rounded-lg bg-white border border-[#DDD5C9] flex items-center justify-center text-[#1A1815] hover:bg-zinc-100 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(product.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 ml-1 cursor-pointer"
                          title="Quitar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totales y Descuentos */}
              {cart.length > 0 && (
                <div className="space-y-1.5 pt-3 border-t border-[#F1ECE5] text-xs">
                  <div className="flex justify-between text-[#6B655C]">
                    <span>Subtotal:</span>
                    <span>S/ {cartSubtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Descuento ({membershipDiscountPercent}%):</span>
                      <span>- S/ {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-[#1A1815] pt-1.5 border-t border-[#E4DED4]">
                    <span>Total a Cobrar:</span>
                    <span className="font-fraunces text-base text-[#B5654A]">
                      S/ {finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Método de Pago */}
              {cart.length > 0 && (
                <div className="space-y-2 pt-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B655C]">
                    Forma de Cobro
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cuenta_interna')}
                      className={`p-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                        paymentMethod === 'cuenta_interna'
                          ? 'bg-[#B5654A] border-[#B5654A] text-white'
                          : 'bg-[#FAF8F5] border-[#E4DED4] text-[#6B655C]'
                      }`}
                    >
                      A Cuenta Alumna
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('yape')}
                      className={`p-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                        paymentMethod === 'yape'
                          ? 'bg-[#6D28D9] border-[#6D28D9] text-white'
                          : 'bg-[#FAF8F5] border-[#E4DED4] text-[#6B655C]'
                      }`}
                    >
                      Yape / Plin
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pos')}
                      className={`p-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                        paymentMethod === 'pos'
                          ? 'bg-[#1A1815] border-[#1A1815] text-white'
                          : 'bg-[#FAF8F5] border-[#E4DED4] text-[#6B655C]'
                      }`}
                    >
                      Tarjeta POS
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('efectivo')}
                      className={`p-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                        paymentMethod === 'efectivo'
                          ? 'bg-emerald-700 border-emerald-700 text-white'
                          : 'bg-[#FAF8F5] border-[#E4DED4] text-[#6B655C]'
                      }`}
                    >
                      Efectivo
                    </button>
                  </div>
                </div>
              )}

              {/* Botón Despachar */}
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={handleConfirmOrder}
                className={`w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                  cart.length === 0
                    ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                    : 'bg-[#B5654A] hover:bg-[#9A5340] text-white shadow-md hover:shadow-lg'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Confirmar Pedido & Despachar</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Vista de Historial de Consumos */
        <div className="bg-white rounded-3xl border border-[#E4DED4] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1ECE5]">
            <h3 className="font-fraunces text-lg font-bold text-[#1A1815]">
              Historial de Consumo en Healthy Bar
            </h3>
            <span className="text-xs text-[#6B655C]">
              {consumptionHistory.length} registros despachados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#6B655C] font-semibold border-b border-[#E4DED4]">
                <tr>
                  <th className="py-3 px-4">Alumna</th>
                  <th className="py-3 px-4">Sala</th>
                  <th className="py-3 px-4">Productos</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Cobro</th>
                  <th className="py-3 px-4">Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1ECE5]">
                {consumptionHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#1A1815]">
                      <div>{rec.clientName}</div>
                      <div className="text-[10px] text-[#AFA79C] font-mono">DNI: {rec.clientDni}</div>
                    </td>
                    <td className="py-3 px-4 text-[#6B655C]">{rec.roomName}</td>
                    <td className="py-3 px-4">
                      {rec.items.map((i, idx) => (
                        <div key={idx} className="text-[#1A1815]">
                          {i.quantity}x {i.productName}
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-4 font-bold font-fraunces text-[#B5654A]">
                      S/ {rec.finalAmount.toFixed(2)}
                      {rec.discountApplied > 0 && (
                        <span className="block text-[10px] text-emerald-700 font-sans font-normal">
                          (Dcto. S/ {rec.discountApplied.toFixed(2)})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          rec.paymentStatus === 'pagado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {rec.paymentStatus === 'pagado' ? `Pagado (${rec.paymentMethod})` : 'En Cuenta Alumna'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#6B655C]">{rec.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
