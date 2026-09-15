import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageCircle,
  Edit2,
  X,
  CreditCard,
  HeartPulse,
  Trash2,
  Check,
  Pencil,
  Download,
  Target,
  UserCheck,
} from 'lucide-react';
import { ClientProfile, LeadRecord, LeadStatus } from '../../types';
import { AdminLeadsTab } from './AdminLeadsTab';

interface AdminClientsTabProps {
  clients: ClientProfile[];
  onAddClient: (newClient: Omit<ClientProfile, 'id'>) => void;
  onUpdateClient: (updatedClient: ClientProfile) => void;
  onDeleteClient?: (clientId: string) => void;
  leads?: LeadRecord[];
  onAddLead?: (lead: Omit<LeadRecord, 'id' | 'createdAt'>) => void;
  onUpdateLead?: (lead: LeadRecord) => void;
  onDeleteLead?: (leadId: string) => void;
  onUpdateLeadStatus?: (id: string, status: LeadStatus) => void;
  onConvertLeadToClient?: (lead: LeadRecord) => void;
  initialSubView?: 'alumnas' | 'leads';
}

export const AdminClientsTab: React.FC<AdminClientsTabProps> = ({
  clients,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  leads = [],
  onAddLead,
  onUpdateLead,
  onDeleteLead,
  onUpdateLeadStatus,
  onConvertLeadToClient,
  initialSubView,
}) => {
  const [activeView, setActiveView] = useState<'alumnas' | 'leads'>(initialSubView || 'alumnas');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activo' | 'en_riesgo' | 'inactivo'>('todos');
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const newLeadsCount = leads.filter((l) => l.status === 'nuevo').length;

  // New client form state
  const [formData, setFormData] = useState({
    name: '',
    dni: '',
    phone: '',
    email: '',
    currentPlan: 'Membresía Ilimitada',
    planType: 'ilimitado' as 'ilimitado' | 'pack' | 'clase_suelta' | 'prueba',
    creditsLeft: 999,
    emergencyContact: '',
    medicalNotes: '',
  });

  // Edit client modal state
  const [editingClient, setEditingClient] = useState<ClientProfile | null>(null);
  const [editClientForm, setEditClientForm] = useState<{
    name: string;
    dni: string;
    phone: string;
    email: string;
    currentPlan: string;
    planType: 'ilimitado' | 'pack' | 'clase_suelta' | 'prueba';
    creditsLeft: number;
    totalAttended: number;
    status: 'activo' | 'en_riesgo' | 'inactivo';
    emergencyContact: string;
    medicalNotes: string;
  }>({
    name: '',
    dni: '',
    phone: '',
    email: '',
    currentPlan: '',
    planType: 'pack',
    creditsLeft: 8,
    totalAttended: 0,
    status: 'activo',
    emergencyContact: '',
    medicalNotes: '',
  });

  const handleStartEditClient = (client: ClientProfile) => {
    setEditingClient(client);
    setEditClientForm({
      name: client.name,
      dni: client.dni,
      phone: client.phone,
      email: client.email,
      currentPlan: client.currentPlan,
      planType: client.planType,
      creditsLeft: client.creditsLeft,
      totalAttended: client.totalAttended,
      status: client.status,
      emergencyContact: client.emergencyContact || '',
      medicalNotes: client.medicalNotes || '',
    });
  };

  const handleSaveEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !editClientForm.name.trim()) return;

    const updated: ClientProfile = {
      ...editingClient,
      name: editClientForm.name.trim(),
      dni: editClientForm.dni.trim() || 'No registrado',
      phone: editClientForm.phone.trim() || '+51 999 000 000',
      email: editClientForm.email.trim() || 'alumno@firmestudio.pe',
      currentPlan: editClientForm.currentPlan,
      planType: editClientForm.planType,
      creditsLeft: editClientForm.planType === 'ilimitado' ? 999 : Number(editClientForm.creditsLeft) || 0,
      totalAttended: Number(editClientForm.totalAttended) || 0,
      status: editClientForm.status,
      emergencyContact: editClientForm.emergencyContact.trim(),
      medicalNotes: editClientForm.medicalNotes.trim(),
    };

    onUpdateClient(updated);
    if (selectedClient && selectedClient.id === updated.id) {
      setSelectedClient(updated);
    }
    setEditingClient(null);
  };

  const handleDeleteClient = (clientId: string, clientName: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el registro de ${clientName}? Esta acción no se puede deshacer.`)) {
      onDeleteClient?.(clientId);
      if (selectedClient?.id === clientId) {
        setSelectedClient(null);
      }
    }
  };

  const filteredClients = clients.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (c.name?.toLowerCase() || '').includes(term) ||
      (c.phone || '').includes(searchTerm) ||
      (c.dni || '').includes(searchTerm) ||
      (c.email?.toLowerCase() || '').includes(term);

    const matchesStatus = statusFilter === 'todos' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onAddClient({
      name: formData.name.trim(),
      dni: formData.dni.trim() || 'No registrado',
      phone: formData.phone.trim() || '+51 999 000 000',
      email: formData.email.trim() || 'alumno@firmestudio.pe',
      currentPlan: formData.currentPlan,
      planType: formData.planType,
      creditsLeft: formData.planType === 'ilimitado' ? 999 : Number(formData.creditsLeft) || 8,
      totalAttended: 0,
      status: 'activo',
      joinDate: new Date().toLocaleDateString('es-PE'),
      lastVisit: 'Recién registrado',
      emergencyContact: formData.emergencyContact.trim(),
      medicalNotes: formData.medicalNotes.trim(),
    });

    setFormData({
      name: '',
      dni: '',
      phone: '',
      email: '',
      currentPlan: 'Membresía Ilimitada',
      planType: 'ilimitado',
      creditsLeft: 999,
      emergencyContact: '',
      medicalNotes: '',
    });
    setShowAddModal(false);
  };

  const handleAdjustCredits = (client: ClientProfile, delta: number) => {
    const newCredits = Math.max(0, client.creditsLeft + delta);
    onUpdateClient({
      ...client,
      creditsLeft: newCredits,
    });
    if (selectedClient && selectedClient.id === client.id) {
      setSelectedClient({ ...client, creditsLeft: newCredits });
    }
  };

  const handleUpdateStatus = (client: ClientProfile, status: 'activo' | 'en_riesgo' | 'inactivo') => {
    onUpdateClient({
      ...client,
      status,
    });
    if (selectedClient && selectedClient.id === client.id) {
      setSelectedClient({ ...client, status });
    }
  };

  const handleExportClientsCsv = () => {
    const headers = [
      'ID',
      'Nombre y Apellidos',
      'DNI',
      'Teléfono',
      'Email',
      'Plan Actual',
      'Tipo de Plan',
      'Créditos Restantes',
      'Total Asistencias',
      'Estado',
      'Contacto de Emergencia',
      'Condición / Notas Biomecánicas',
    ];

    const rows = clients.map((c) => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      c.dni,
      c.phone,
      c.email,
      `"${c.currentPlan.replace(/"/g, '""')}"`,
      c.planType,
      c.creditsLeft.toString(),
      c.totalAttended.toString(),
      c.status,
      `"${(c.emergencyContact || '').replace(/"/g, '""')}"`,
      `"${(c.medicalNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `base_alumnos_firme_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs: Alumnas Registradas vs Prospectos & Leads */}
      <div className="bg-[#FAF8F5] border border-[#E4DED4] p-1.5 rounded-2xl flex items-center gap-1.5 w-fit shadow-xs">
        <button
          type="button"
          onClick={() => setActiveView('alumnas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeView === 'alumnas'
              ? 'bg-[#1A1815] text-white shadow-xs'
              : 'text-[#6B655C] hover:text-[#1A1815] hover:bg-white/60'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Alumnas Registradas</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeView === 'alumnas' ? 'bg-white/20 text-white' : 'bg-[#E4DED4] text-[#1A1815]'
            }`}
          >
            {clients.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('leads')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeView === 'leads'
              ? 'bg-[#1A1815] text-white shadow-xs'
              : 'text-[#6B655C] hover:text-[#1A1815] hover:bg-white/60'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-rose-500" />
          <span>Captación de Leads</span>
          {newLeadsCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold animate-pulse">
              {newLeadsCount} nuevos
            </span>
          ) : (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeView === 'leads' ? 'bg-white/20 text-white' : 'bg-[#E4DED4] text-[#1A1815]'
              }`}
            >
              {leads.length}
            </span>
          )}
        </button>
      </div>

      {activeView === 'leads' ? (
        <AdminLeadsTab
          leads={leads}
          onAddLead={onAddLead || (() => {})}
          onUpdateLead={onUpdateLead}
          onDeleteLead={onDeleteLead}
          onUpdateLeadStatus={onUpdateLeadStatus || (() => {})}
          onConvertLeadToClient={onConvertLeadToClient || (() => {})}
        />
      ) : (
        <>
          {/* Top Header */}
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-fraunces text-xl font-medium text-[#1A1815]">
                Directorio & CRM de Alumnos
              </h2>
          <p className="text-xs text-[#6B655C] mt-0.5">
            Historial de membresías, créditos de clases restantes, notas biomecánicas y contacto.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportClientsCsv}
            className="bg-[#F1ECE5] hover:bg-[#E4DED4] text-[#1A1815] border border-[#E4DED4] px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            title="Descargar base de alumnos en CSV compatible con Excel"
          >
            <Download className="w-3.5 h-3.5 text-[#B5654A]" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-[#B5654A] hover:bg-[#9A5340] text-[#FAF8F5] px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nuevo Alumno</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#FAF8F5] border border-[#E4DED4] p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-[#6B655C] block">Total Alumnos</span>
          <span className="text-2xl font-bold text-[#1A1815] mt-1 block">{clients.length}</span>
        </div>
        <div className="bg-[#FAF8F5] border border-[#E4DED4] p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-[#6B655C] block">Activos</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {clients.filter((c) => c.status === 'activo').length}
          </span>
        </div>
        <div className="bg-[#FAF8F5] border border-[#E4DED4] p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-[#6B655C] block">En Riesgo (&gt;14d)</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">
            {clients.filter((c) => c.status === 'en_riesgo').length}
          </span>
        </div>
        <div className="bg-[#FAF8F5] border border-[#E4DED4] p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-[#6B655C] block">Packs con saldo bajo</span>
          <span className="text-2xl font-bold text-rose-700 mt-1 block">
            {clients.filter((c) => c.planType === 'pack' && c.creditsLeft <= 2).length}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#FAF8F5] border border-[#E4DED4] p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6B655C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, DNI, teléfono..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815] focus:outline-none focus:border-[#B5654A]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(['todos', 'activo', 'en_riesgo', 'inactivo'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#1A1815] text-[#FAF8F5]'
                  : 'bg-[#F1ECE5] text-[#6B655C] hover:text-[#1A1815]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F1ECE5] text-[#6B655C] font-semibold uppercase tracking-wider border-b border-[#E4DED4] text-[10px]">
              <tr>
                <th className="py-3 px-4">Alumno</th>
                <th className="py-3 px-4">Contacto / DNI</th>
                <th className="py-3 px-4">Plan / Membresía</th>
                <th className="py-3 px-4 text-center">Créditos</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Última Asistencia</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4DED4] text-[#1A1815]">
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-[#F1ECE5]/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#E4DED4] text-[#B5654A] font-bold flex items-center justify-center text-xs shrink-0">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-xs block">{client.name}</span>
                        <span className="text-[10px] text-[#6B655C]">{client.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-[11px]">
                      <span className="block font-medium">{client.phone}</span>
                      <span className="text-[10px] text-[#6B655C]">DNI: {client.dni}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#E4DED4] text-[#1A1815]">
                      {client.currentPlan}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold">
                    {client.planType === 'ilimitado' ? (
                      <span className="text-emerald-700 text-xs font-semibold">Ilimitado</span>
                    ) : (
                      <span className={`text-xs ${client.creditsLeft <= 2 ? 'text-rose-600 font-bold' : 'text-[#1A1815]'}`}>
                        {client.creditsLeft} clases
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        client.status === 'activo'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : client.status === 'en_riesgo'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {client.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-[11px] text-[#6B655C]">
                    {client.lastVisit}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`https://wa.me/${client.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(
                          client.name
                        )},%20te%20saludamos%20desde%20FIRME%20STUDIO%20SJL.`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-[#FAF8F5] transition-colors cursor-pointer"
                        title="Abrir WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => setSelectedClient(client)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-[#F1ECE5] hover:bg-[#E4DED4] text-[#1A1815] rounded transition-colors cursor-pointer border border-[#DDD5C9]"
                      >
                        Ficha
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEditClient(client)}
                        className="p-1.5 rounded bg-[#F1ECE5] hover:bg-[#E4DED4] text-[#1A1815] transition-colors cursor-pointer border border-[#DDD5C9]"
                        title="Editar datos del alumno"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#B5654A]" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteClient(client.id, client.name)}
                        className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer border border-rose-200"
                        title="Eliminar alumno"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4DED4]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B5654A] bg-[#B5654A]/10 px-2 py-0.5 rounded">
                  Ficha de Alumno · FIRME STUDIO
                </span>
                <h3 className="font-fraunces text-xl font-medium text-[#1A1815] mt-1">
                  {selectedClient.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="p-1 rounded-md text-[#6B655C] hover:text-[#1A1815] hover:bg-[#E4DED4]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#F1ECE5] border border-[#E4DED4]">
                <span className="text-[10px] text-[#6B655C] block">Teléfono / WhatsApp</span>
                <span className="font-semibold text-[#1A1815] mt-0.5 block">{selectedClient.phone}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#F1ECE5] border border-[#E4DED4]">
                <span className="text-[10px] text-[#6B655C] block">Documento de Identidad</span>
                <span className="font-semibold text-[#1A1815] mt-0.5 block">DNI {selectedClient.dni}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#F1ECE5] border border-[#E4DED4]">
                <span className="text-[10px] text-[#6B655C] block">Plan Actual</span>
                <span className="font-semibold text-[#1A1815] mt-0.5 block">{selectedClient.currentPlan}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#F1ECE5] border border-[#E4DED4]">
                <span className="text-[10px] text-[#6B655C] block">Créditos Restantes</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-bold text-sm text-[#B5654A]">
                    {selectedClient.planType === 'ilimitado' ? 'Ilimitado' : selectedClient.creditsLeft}
                  </span>
                  {selectedClient.planType !== 'ilimitado' && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleAdjustCredits(selectedClient, -1)}
                        className="px-1.5 py-0.5 bg-[#E4DED4] hover:bg-[#DDD5C9] rounded font-bold text-xs"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustCredits(selectedClient, +1)}
                        className="px-1.5 py-0.5 bg-[#B5654A] hover:bg-[#9A5340] text-[#FAF8F5] rounded font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Medical / Biomechanical Observations */}
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
              <div className="flex items-center gap-1.5 text-amber-900 font-semibold mb-1">
                <HeartPulse className="w-4 h-4 text-amber-700" />
                <span>Observaciones Físicas / Biomecánicas:</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                {selectedClient.medicalNotes || 'Sin notas clínicas registradas. El alumno puede realizar todos los ejercicios estándar.'}
              </p>
            </div>

            {/* Emergency Contact */}
            {selectedClient.emergencyContact && (
              <div className="text-xs text-[#6B655C]">
                <strong>Contacto de Emergencia:</strong> {selectedClient.emergencyContact}
              </div>
            )}

            {/* Status change buttons & Full Edit */}
            <div className="pt-3 border-t border-[#E4DED4] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#6B655C]">Estado:</span>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedClient, 'activo')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                    selectedClient.status === 'activo' ? 'bg-emerald-600 text-white' : 'bg-[#E4DED4]'
                  }`}
                >
                  Activo
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedClient, 'en_riesgo')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                    selectedClient.status === 'en_riesgo' ? 'bg-amber-600 text-white' : 'bg-[#E4DED4]'
                  }`}
                >
                  En Riesgo
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedClient, 'inactivo')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                    selectedClient.status === 'inactivo' ? 'bg-zinc-700 text-white' : 'bg-[#E4DED4]'
                  }`}
                >
                  Inactivo
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleStartEditClient(selectedClient);
                  }}
                  className="px-3 py-1.5 bg-[#F1ECE5] hover:bg-[#E4DED4] text-[#1A1815] text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 border border-[#DDD5C9] cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#B5654A]" />
                  <span>Editar Datos</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteClient(selectedClient.id, selectedClient.name)}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                  title="Eliminar alumno"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <a
                  href={`https://wa.me/${selectedClient.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <form
            onSubmit={handleCreateClient}
            className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E4DED4]">
              <h3 className="font-fraunces text-lg font-medium text-[#1A1815]">
                Registrar Nuevo Alumno en Firme Studio
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-[#6B655C] hover:text-[#1A1815]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Sofía Mendoza..."
                  className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">DNI</label>
                <input
                  type="text"
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  placeholder="Ej. 72849102"
                  className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">WhatsApp / Celular *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+51 984 123 456"
                  className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alumno@ejemplo.com"
                  className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">Plan / Membresía</label>
                <select
                  value={formData.currentPlan}
                  onChange={(e) => {
                    const plan = e.target.value;
                    let type: 'ilimitado' | 'pack' | 'clase_suelta' | 'prueba' = 'ilimitado';
                    let cred = 999;
                    if (plan.includes('Pack 8')) {
                      type = 'pack';
                      cred = 8;
                    } else if (plan.includes('Clase suelta')) {
                      type = 'clase_suelta';
                      cred = 1;
                    }
                    setFormData({ ...formData, currentPlan: plan, planType: type, creditsLeft: cred });
                  }}
                  className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815]"
                >
                  <option value="Membresía ilimitada">Membresía ilimitada (S/. 890)</option>
                  <option value="Pack 8 clases">Pack 8 clases (S/. 680)</option>
                  <option value="Membresía + privadas">Membresía + privadas (S/. 1,350)</option>
                  <option value="Clase suelta">Clase suelta (S/. 95)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">Contacto de Emergencia</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="Nombre y teléfono familiar..."
                  className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                Notas Biomecánicas / Médicas (Lesiones, hernias, embarazo)
              </label>
              <textarea
                rows={2}
                value={formData.medicalNotes}
                onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                placeholder="Ej. Dolor lumbar en extensión, hipermovilidad, etc."
                className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-xs text-[#1A1815]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E4DED4]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-[#6B655C] hover:text-[#1A1815]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Guardar Alumno
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEditClient}
            className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E4DED4]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#B5654A]/10 text-[#B5654A]">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-fraunces text-lg font-medium text-[#1A1815]">
                    Editar Ficha del Alumno
                  </h3>
                  <p className="text-xs text-[#6B655C]">
                    Actualiza datos personales, saldo de créditos, estado y observaciones biomecánicas.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="p-1.5 text-[#6B655C] hover:text-[#1A1815] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#6B655C] mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={editClientForm.name}
                  onChange={(e) => setEditClientForm({ ...editClientForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815] focus:outline-hidden focus:ring-2 focus:ring-[#B5654A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#6B655C] mb-1">DNI / Documento</label>
                <input
                  type="text"
                  value={editClientForm.dni}
                  onChange={(e) => setEditClientForm({ ...editClientForm, dni: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#6B655C] mb-1">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={editClientForm.phone}
                  onChange={(e) => setEditClientForm({ ...editClientForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#6B655C] mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={editClientForm.email}
                  onChange={(e) => setEditClientForm({ ...editClientForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#6B655C] mb-1">Plan Actual</label>
                <input
                  type="text"
                  required
                  value={editClientForm.currentPlan}
                  onChange={(e) => setEditClientForm({ ...editClientForm, currentPlan: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#6B655C] mb-1">Tipo de Plan</label>
                <select
                  value={editClientForm.planType}
                  onChange={(e) =>
                    setEditClientForm({
                      ...editClientForm,
                      planType: e.target.value as any,
                      creditsLeft: e.target.value === 'ilimitado' ? 999 : editClientForm.creditsLeft,
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                >
                  <option value="ilimitado">Membresía Ilimitada</option>
                  <option value="pack">Pack de Clases (Fijo)</option>
                  <option value="clase_suelta">Clase Suelta</option>
                  <option value="prueba">Clase de Prueba</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#6B655C] mb-1">Créditos Restantes</label>
                <input
                  type="number"
                  min="0"
                  disabled={editClientForm.planType === 'ilimitado'}
                  value={editClientForm.creditsLeft}
                  onChange={(e) => setEditClientForm({ ...editClientForm, creditsLeft: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#6B655C] mb-1">Clases Asistidas Históricas</label>
                <input
                  type="number"
                  min="0"
                  value={editClientForm.totalAttended}
                  onChange={(e) => setEditClientForm({ ...editClientForm, totalAttended: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#6B655C] mb-1">Estado del Alumno</label>
                <select
                  value={editClientForm.status}
                  onChange={(e) => setEditClientForm({ ...editClientForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                >
                  <option value="activo">Activo (Asistencia regular)</option>
                  <option value="en_riesgo">En Riesgo (&gt;14 días sin asistir)</option>
                  <option value="inactivo">Inactivo / Pausado</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#6B655C] mb-1">Contacto de Emergencia</label>
                <input
                  type="text"
                  value={editClientForm.emergencyContact}
                  onChange={(e) => setEditClientForm({ ...editClientForm, emergencyContact: e.target.value })}
                  placeholder="Nombre y teléfono..."
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#6B655C] mb-1 text-xs">
                Notas Biomecánicas / Patologías Médicas
              </label>
              <textarea
                rows={2}
                value={editClientForm.medicalNotes}
                onChange={(e) => setEditClientForm({ ...editClientForm, medicalNotes: e.target.value })}
                placeholder="Heridas, cirugías previas, contraindicaciones posturales en reformer..."
                className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-xs text-[#1A1815] resize-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E4DED4]">
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="px-4 py-2 text-xs text-[#6B655C] hover:text-[#1A1815] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Actualizar Alumno</span>
              </button>
            </div>
          </form>
        </div>
      )}
        </>
      )}
    </div>
  );
};
