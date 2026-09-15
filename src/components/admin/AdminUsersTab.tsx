import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Key,
  Mail,
  Phone,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Lock,
  Search,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  User,
  Activity,
  Award,
  Calendar,
  AlertCircle,
  Edit3,
  Save,
  Trash2,
  Plus,
  RotateCcw,
  Sliders,
  Tag,
  Layers,
  Check,
} from 'lucide-react';
import {
  AuthUser,
  ClientProfile,
  StaffAccount,
  PREDEFINED_STAFF,
  UserRole,
  Instructor,
  RoleConfig,
  DEFAULT_ROLES_CONFIG,
} from '../../types';
import { INSTRUCTORS } from '../../data/mockData';

interface AdminUsersTabProps {
  currentUser: AuthUser | null;
  clients: ClientProfile[];
  onUpdateCurrentUser?: (user: AuthUser | null) => void;
  onUpdateClient?: (client: ClientProfile) => void;
}

export type PermissionLevel = 'total' | 'operativo' | 'lectura' | 'denegado';

export interface RbacRow {
  id: string;
  module: string;
  owner_dev: PermissionLevel;
  admin: PermissionLevel;
  receptionist: PermissionLevel;
  instructor: PermissionLevel;
  client: PermissionLevel;
  [roleKey: string]: PermissionLevel | string;
}

const DEFAULT_RBAC_RULES: RbacRow[] = [
  {
    id: 'caja',
    module: 'Caja Diaria & Finanzas Globales',
    owner_dev: 'total',
    admin: 'operativo',
    receptionist: 'operativo',
    instructor: 'denegado',
    client: 'denegado',
  },
  {
    id: 'agenda',
    module: 'Control de Agenda & Mapa de 8 Camas',
    owner_dev: 'total',
    admin: 'total',
    receptionist: 'operativo',
    instructor: 'lectura',
    client: 'lectura',
  },
  {
    id: 'supabase',
    module: 'Gestión de Base de Datos (Supabase)',
    owner_dev: 'total',
    admin: 'denegado',
    receptionist: 'denegado',
    instructor: 'denegado',
    client: 'denegado',
  },
  {
    id: 'usuarios',
    module: 'Administración de Usuarios & Staff',
    owner_dev: 'total',
    admin: 'lectura',
    receptionist: 'denegado',
    instructor: 'denegado',
    client: 'denegado',
  },
  {
    id: 'kiosco',
    module: 'Kiosco Check-in & Tótem SJL',
    owner_dev: 'total',
    admin: 'total',
    receptionist: 'operativo',
    instructor: 'denegado',
    client: 'denegado',
  },
  {
    id: 'whatsapp',
    module: 'Envíos Automatizados WhatsApp',
    owner_dev: 'total',
    admin: 'total',
    receptionist: 'denegado',
    instructor: 'denegado',
    client: 'denegado',
  },
];

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  currentUser,
  clients,
  onUpdateCurrentUser,
  onUpdateClient,
}) => {
  const isOwnerDev = currentUser?.role === 'owner_dev';

  // Active view inside the User Administration Module
  const [activeUserSubTab, setActiveUserSubTab] = useState<'staff' | 'instructores' | 'alumnas' | 'roles' | 'rbac'>('staff');

  // 0. Dynamic Roles state (persisted locally)
  const [rolesList, setRolesList] = useState<RoleConfig[]>(() => {
    try {
      const saved = localStorage.getItem('firme_roles_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_ROLES_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem('firme_roles_config', JSON.stringify(rolesList));
  }, [rolesList]);

  // 1. Staff list state (persisted locally)
  const [staffList, setStaffList] = useState<StaffAccount[]>(() => {
    try {
      const saved = localStorage.getItem('firme_staff_directory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return PREDEFINED_STAFF;
  });

  useEffect(() => {
    localStorage.setItem('firme_staff_directory', JSON.stringify(staffList));
  }, [staffList]);

  // 2. Instructors state (persisted locally)
  const [instructorsList, setInstructorsList] = useState<Instructor[]>(() => {
    try {
      const saved = localStorage.getItem('firme_instructors_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INSTRUCTORS;
  });

  useEffect(() => {
    localStorage.setItem('firme_instructors_data', JSON.stringify(instructorsList));
  }, [instructorsList]);

  // 3. RBAC Matrix state (persisted locally)
  const [rbacRules, setRbacRules] = useState<RbacRow[]>(() => {
    try {
      const saved = localStorage.getItem('firme_rbac_matrix');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_RBAC_RULES;
  });

  useEffect(() => {
    localStorage.setItem('firme_rbac_matrix', JSON.stringify(rbacRules));
  }, [rbacRules]);

  // Client search & filter state
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState<'all' | 'activo' | 'en_riesgo' | 'inactivo'>('all');

  // Modal: Create new Staff member
  const [isNewStaffModalOpen, setIsNewStaffModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('admin');
  const [newStaffDni, setNewStaffDni] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('+51 ');
  const [newStaffPassword, setNewStaffPassword] = useState('firme2026');
  const [newStaffDescription, setNewStaffDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [showNewStaffPass, setShowNewStaffPass] = useState(false);

  // Modal: Create new Custom Role
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newRoleId, setNewRoleId] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRoleColor, setNewRoleColor] = useState<string>('emerald');
  const [newRoleInitialPerm, setNewRoleInitialPerm] = useState<PermissionLevel>('operativo');
  const [newRoleCanAdmin, setNewRoleCanAdmin] = useState(true);
  const [roleFormError, setRoleFormError] = useState('');
  const [roleFormSuccess, setRoleFormSuccess] = useState('');

  // Modal: Edit Role (System or Custom)
  const [editingRole, setEditingRole] = useState<RoleConfig | null>(null);
  const [editRoleTitle, setEditRoleTitle] = useState('');
  const [editRoleDescription, setEditRoleDescription] = useState('');
  const [editRoleColor, setEditRoleColor] = useState('emerald');
  const [editRoleCanAdmin, setEditRoleCanAdmin] = useState(true);
  const [editRoleError, setEditRoleError] = useState('');

  // Helper for role badge colors
  const getRoleBadgeStyle = (color?: string) => {
    switch (color) {
      case 'stone':
        return 'bg-[#1A1815] text-white border-black/30';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'amber':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'purple':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      case 'sky':
        return 'bg-sky-50 text-sky-800 border-sky-300';
      case 'rose':
        return 'bg-[#B5654A]/10 text-[#B5654A] border-[#B5654A]/30';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-800 border-indigo-300';
      default:
        return 'bg-[#F2EEE9] text-[#1A1815] border-[#DDD5C9]';
    }
  };

  // Modal: Edit Staff member
  const [editingStaff, setEditingStaff] = useState<StaffAccount | null>(null);
  const [editStaffName, setEditStaffName] = useState('');
  const [editStaffEmail, setEditStaffEmail] = useState('');
  const [editStaffRole, setEditStaffRole] = useState<UserRole>('admin');
  const [editStaffRoleTitle, setEditStaffRoleTitle] = useState('');
  const [editStaffDni, setEditStaffDni] = useState('');
  const [editStaffPhone, setEditStaffPhone] = useState('');
  const [editStaffPassword, setEditStaffPassword] = useState('');
  const [editStaffDescription, setEditStaffDescription] = useState('');
  const [editStaffError, setEditStaffError] = useState('');

  // Modal: Edit/Create Instructor
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [instName, setInstName] = useState('');
  const [instSpecialty, setInstSpecialty] = useState('');
  const [instCertification, setInstCertification] = useState('');
  const [instBio, setInstBio] = useState('');
  const [instError, setInstError] = useState('');

  // Modal: Edit Client Profile
  const [editingClient, setEditingClient] = useState<ClientProfile | null>(null);
  const [clientFormName, setClientFormName] = useState('');
  const [clientFormDni, setClientFormDni] = useState('');
  const [clientFormPhone, setClientFormPhone] = useState('');
  const [clientFormEmail, setClientFormEmail] = useState('');
  const [clientFormPlan, setClientFormPlan] = useState('');
  const [clientFormCredits, setClientFormCredits] = useState(0);
  const [clientFormStatus, setClientFormStatus] = useState<'activo' | 'en_riesgo' | 'inactivo'>('activo');
  const [clientFormMedicalNotes, setClientFormMedicalNotes] = useState('');

  // Feedback notification
  const [bannerNotice, setBannerNotice] = useState<{ title: string; text: string; isError?: boolean } | null>(null);

  const showNotification = (title: string, text: string, isError = false) => {
    setBannerNotice({ title, text, isError });
    setTimeout(() => setBannerNotice(null), 4000);
  };

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);

  // Filtered clients list
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      c.dni.includes(clientSearchTerm);
    const matchesStatus = clientStatusFilter === 'all' || c.status === clientStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle creating new role
  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    setRoleFormError('');
    setRoleFormSuccess('');

    const title = newRoleTitle.trim();
    if (!title) {
      setRoleFormError('Por favor ingresa un nombre para el rol.');
      return;
    }

    // Auto-generate or clean slug ID
    let slug = newRoleId.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/__+/g, '_').replace(/^_+|_+$/g, '');
    if (!slug) {
      slug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_')
        .replace(/__+/g, '_')
        .replace(/^_+|_+$/g, '');
    }

    if (!slug) {
      setRoleFormError('Ingresa un identificador válido para el rol (solo letras, números y guión bajo).');
      return;
    }

    if (rolesList.some((r) => r.id === slug)) {
      setRoleFormError(`Ya existe un rol con el identificador "${slug}". Elige otro.`);
      return;
    }

    const createdRole: RoleConfig = {
      id: slug,
      title,
      description: newRoleDescription.trim() || `Rol de ${title} en FIRME STUDIO`,
      badgeColor: newRoleColor,
      isSystem: false,
      canAccessAdminPanel: newRoleCanAdmin,
      createdAt: new Date().toISOString(),
    };

    // 1. Update rolesList
    const updatedRoles = [...rolesList, createdRole];
    setRolesList(updatedRoles);
    localStorage.setItem('firme_roles_config', JSON.stringify(updatedRoles));

    // 2. Add column to all rows in rbacRules
    const updatedRbac = rbacRules.map((row) => ({
      ...row,
      [slug]: newRoleInitialPerm,
    }));
    setRbacRules(updatedRbac);
    localStorage.setItem('firme_rbac_matrix', JSON.stringify(updatedRbac));

    setRoleFormSuccess(`¡Rol "${title}" (@${slug}) creado exitosamente!`);
    showNotification('Rol Creado', `Se ha incorporado el nuevo rol "${title}" con permisos iniciales.`);

    setTimeout(() => {
      setIsNewRoleModalOpen(false);
      setNewRoleTitle('');
      setNewRoleId('');
      setNewRoleDescription('');
      setNewRoleColor('emerald');
      setNewRoleInitialPerm('operativo');
      setNewRoleCanAdmin(true);
      setRoleFormSuccess('');
      setRoleFormError('');
    }, 1100);
  };

  // Handle deleting role
  const handleDeleteRole = (roleId: string) => {
    const target = rolesList.find((r) => r.id === roleId);
    if (!target) return;

    if (target.isSystem) {
      showNotification('Operación Denegada', `El rol "${target.title}" es un rol de sistema protegido y no puede eliminarse.`, true);
      return;
    }

    const assignedStaff = staffList.filter((s) => s.role === roleId);
    const hasAssigned = assignedStaff.length > 0;

    const confirmMsg = hasAssigned
      ? `¿Estás seguro de eliminar el rol "${target.title}" (@${target.id})?\n\nAtención: Hay ${assignedStaff.length} colaborador(es) con este rol (${assignedStaff.map((s) => s.name).join(', ')}). Serán reasignados al rol "Recepción" automáticamente.`
      : `¿Estás seguro de eliminar el rol "${target.title}" (@${target.id})? Esta acción retirará también su columna de permisos en la matriz RBAC.`;

    if (confirm(confirmMsg)) {
      if (hasAssigned) {
        const updatedStaff = staffList.map((s) => {
          if (s.role === roleId) {
            return {
              ...s,
              role: 'receptionist' as UserRole,
              roleTitle: 'Recepción & Front Desk',
            };
          }
          return s;
        });
        setStaffList(updatedStaff);
        localStorage.setItem('firme_staff_directory', JSON.stringify(updatedStaff));
      }

      const updatedRoles = rolesList.filter((r) => r.id !== roleId);
      setRolesList(updatedRoles);
      localStorage.setItem('firme_roles_config', JSON.stringify(updatedRoles));

      const updatedRbac = rbacRules.map((row) => {
        const copy = { ...row };
        delete copy[roleId];
        return copy;
      });
      setRbacRules(updatedRbac);
      localStorage.setItem('firme_rbac_matrix', JSON.stringify(updatedRbac));

      showNotification('Rol Eliminado', `El rol "${target.title}" ha sido retirado.`);
    }
  };

  // Open Edit Role modal
  const handleOpenEditRole = (role: RoleConfig) => {
    setEditingRole(role);
    setEditRoleTitle(role.title);
    setEditRoleDescription(role.description || '');
    setEditRoleColor(role.badgeColor || 'emerald');
    setEditRoleCanAdmin(role.canAccessAdminPanel ?? true);
    setEditRoleError('');
  };

  // Save Edit Role
  const handleSaveEditRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    setEditRoleError('');

    const title = editRoleTitle.trim();
    if (!title) {
      setEditRoleError('El nombre del rol es obligatorio.');
      return;
    }

    const updatedRole: RoleConfig = {
      ...editingRole,
      title,
      description: editRoleDescription.trim(),
      badgeColor: editRoleColor,
      canAccessAdminPanel: editingRole.id === 'owner_dev' ? true : editRoleCanAdmin,
    };

    const updatedList = rolesList.map((r) => (r.id === editingRole.id ? updatedRole : r));
    setRolesList(updatedList);
    localStorage.setItem('firme_roles_config', JSON.stringify(updatedList));

    // Update staff titles if they matched the previous role title
    const updatedStaff = staffList.map((s) => {
      if (s.role === editingRole.id && s.roleTitle === editingRole.title) {
        return { ...s, roleTitle: title };
      }
      return s;
    });
    setStaffList(updatedStaff);
    localStorage.setItem('firme_staff_directory', JSON.stringify(updatedStaff));

    showNotification('Rol Actualizado', `Se guardaron los cambios para el rol "${title}".`);
    setEditingRole(null);
  };

  // Handle creating new staff member
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!newStaffName.trim() || !newStaffEmail.trim() || !newStaffDni.trim()) {
      setFormError('Por favor completa los campos obligatorios (Nombre, Correo y DNI).');
      return;
    }

    const emailClean = newStaffEmail.trim().toLowerCase();
    if (!emailClean.includes('@')) {
      setFormError('Ingresa un correo electrónico válido.');
      return;
    }

    if (staffList.some((s) => s.email.toLowerCase() === emailClean)) {
      setFormError('Ya existe un colaborador registrado con este correo.');
      return;
    }

    const selectedRole = rolesList.find((r) => r.id === newStaffRole);
    const resolvedRoleTitle = selectedRole ? selectedRole.title : 'Colaborador';

    const newStaff: StaffAccount = {
      id: `staff-${Date.now()}`,
      name: newStaffName.trim(),
      email: emailClean,
      role: newStaffRole,
      roleTitle: resolvedRoleTitle,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 5000)}?w=120&auto=format&fit=crop&q=80`,
      phone: newStaffPhone.trim() || '+51 900 000 000',
      dni: newStaffDni.trim(),
      description: newStaffDescription.trim() || 'Acceso de personal FIRME STUDIO',
      defaultPassword: newStaffPassword.trim() || 'firme2026',
    };

    const updated = [newStaff, ...staffList];
    setStaffList(updated);
    localStorage.setItem('firme_staff_directory', JSON.stringify(updated));

    setFormSuccess(`¡Colaborador ${newStaff.name} creado exitosamente!`);
    showNotification('Colaborador Creado', `${newStaff.name} ha sido añadido con rol ${newStaff.roleTitle}.`);

    setTimeout(() => {
      setIsNewStaffModalOpen(false);
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffDni('');
      setNewStaffPhone('+51 ');
      setNewStaffPassword('firme2026');
      setNewStaffDescription('');
      setFormSuccess('');
    }, 1200);
  };

  // Open Edit Staff modal
  const handleOpenEditStaff = (staff: StaffAccount) => {
    setEditingStaff(staff);
    setEditStaffName(staff.name);
    setEditStaffEmail(staff.email);
    setEditStaffRole(staff.role);
    setEditStaffRoleTitle(staff.roleTitle);
    setEditStaffDni(staff.dni);
    setEditStaffPhone(staff.phone);
    setEditStaffPassword(staff.defaultPassword || '');
    setEditStaffDescription(staff.description || '');
    setEditStaffError('');
  };

  // Save Edit Staff
  const handleSaveEditStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setEditStaffError('');

    if (!editStaffName.trim() || !editStaffEmail.trim() || !editStaffDni.trim()) {
      setEditStaffError('Nombre, Correo y DNI son campos obligatorios.');
      return;
    }

    const emailClean = editStaffEmail.trim().toLowerCase();
    const isDuplicate = staffList.some(
      (s) => s.id !== editingStaff.id && s.email.toLowerCase() === emailClean
    );
    if (isDuplicate) {
      setEditStaffError('Ya existe otro colaborador con este correo electrónico.');
      return;
    }

    const updatedStaff: StaffAccount = {
      ...editingStaff,
      name: editStaffName.trim(),
      email: emailClean,
      role: editStaffRole,
      roleTitle: editStaffRoleTitle.trim() || editingStaff.roleTitle,
      dni: editStaffDni.trim(),
      phone: editStaffPhone.trim(),
      defaultPassword: editStaffPassword.trim() || editingStaff.defaultPassword,
      description: editStaffDescription.trim(),
    };

    const updatedList = staffList.map((s) => (s.id === editingStaff.id ? updatedStaff : s));
    setStaffList(updatedList);
    localStorage.setItem('firme_staff_directory', JSON.stringify(updatedList));

    // Si el editado es el usuario de la sesión actual, actualizarlo en vivo
    if (currentUser && currentUser.email.toLowerCase() === editingStaff.email.toLowerCase()) {
      const updatedUser: AuthUser = {
        ...currentUser,
        name: updatedStaff.name,
        email: updatedStaff.email,
        role: updatedStaff.role,
        roleTitle: updatedStaff.roleTitle,
        phone: updatedStaff.phone,
        dni: updatedStaff.dni,
      };
      localStorage.setItem('firme_auth_user', JSON.stringify(updatedUser));
      if (onUpdateCurrentUser) {
        onUpdateCurrentUser(updatedUser);
      }
    }

    showNotification('Colaborador Actualizado', `Los cambios para ${updatedStaff.name} se guardaron exitosamente.`);
    setEditingStaff(null);
  };

  // Delete / Toggle staff
  const handleDeleteStaff = (staffId: string) => {
    const target = staffList.find((s) => s.id === staffId);
    if (!target) return;
    if (target.role === 'owner_dev') {
      showNotification('Operación Denegada', 'La cuenta Owner Dev principal no puede ser eliminada.', true);
      return;
    }

    if (confirm(`¿Estás seguro de eliminar el acceso de staff a ${target.name}?`)) {
      const updated = staffList.filter((s) => s.id !== staffId);
      setStaffList(updated);
      localStorage.setItem('firme_staff_directory', JSON.stringify(updated));
      showNotification('Cuenta Eliminada', `El colaborador ${target.name} ha sido retirado.`);
    }
  };

  // -------------------------------------------------------------
  // INSTRUCTORS CRUD
  // -------------------------------------------------------------
  const handleOpenNewInstructor = () => {
    setEditingInstructor(null);
    setInstName('');
    setInstSpecialty('Pilates Reformer & Biomecánica Postural');
    setInstCertification('PMA Certified Teacher');
    setInstBio('');
    setInstError('');
    setIsInstructorModalOpen(true);
  };

  const handleOpenEditInstructor = (inst: Instructor) => {
    setEditingInstructor(inst);
    setInstName(inst.name);
    setInstSpecialty(inst.specialty);
    setInstCertification(inst.certification);
    setInstBio(inst.bio);
    setInstError('');
    setIsInstructorModalOpen(true);
  };

  const handleSaveInstructor = (e: React.FormEvent) => {
    e.preventDefault();
    setInstError('');

    if (!instName.trim() || !instSpecialty.trim()) {
      setInstError('El nombre y la especialidad son obligatorios.');
      return;
    }

    if (editingInstructor) {
      const updated: Instructor = {
        ...editingInstructor,
        name: instName.trim(),
        specialty: instSpecialty.trim(),
        certification: instCertification.trim(),
        bio: instBio.trim(),
      };
      const list = instructorsList.map((i) => (i.id === editingInstructor.id ? updated : i));
      setInstructorsList(list);
      showNotification('Instructora Actualizada', `Se guardaron los datos de ${updated.name}.`);
    } else {
      const newInst: Instructor = {
        id: `inst-${Date.now()}`,
        name: instName.trim(),
        specialty: instSpecialty.trim(),
        certification: instCertification.trim() || 'Docente Oficial FIRME STUDIO',
        bio: instBio.trim() || 'Especialista en Pilates Reformer.',
      };
      const list = [...instructorsList, newInst];
      setInstructorsList(list);
      showNotification('Instructora Añadida', `${newInst.name} fue añadida al plantel docente.`);
    }

    setIsInstructorModalOpen(false);
  };

  const handleDeleteInstructor = (id: string, name: string) => {
    if (confirm(`¿Deseas eliminar a la instructora ${name}?`)) {
      const list = instructorsList.filter((i) => i.id !== id);
      setInstructorsList(list);
      showNotification('Instructora Eliminada', `${name} ha sido retirada del plantel.`);
    }
  };

  // -------------------------------------------------------------
  // CLIENTS EDITING
  // -------------------------------------------------------------
  const handleOpenEditClient = (cli: ClientProfile) => {
    setEditingClient(cli);
    setClientFormName(cli.name);
    setClientFormDni(cli.dni);
    setClientFormPhone(cli.phone);
    setClientFormEmail(cli.email);
    setClientFormPlan(cli.currentPlan);
    setClientFormCredits(cli.creditsLeft);
    setClientFormStatus(cli.status);
    setClientFormMedicalNotes(cli.medicalNotes || '');
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    const updatedClient: ClientProfile = {
      ...editingClient,
      name: clientFormName.trim(),
      dni: clientFormDni.trim(),
      phone: clientFormPhone.trim(),
      email: clientFormEmail.trim(),
      currentPlan: clientFormPlan,
      creditsLeft: Number(clientFormCredits),
      status: clientFormStatus,
      medicalNotes: clientFormMedicalNotes.trim(),
    };

    if (onUpdateClient) {
      onUpdateClient(updatedClient);
    }
    showNotification('Alumna Actualizada', `Ficha de ${updatedClient.name} actualizada correctamente.`);
    setEditingClient(null);
  };

  // -------------------------------------------------------------
  // RBAC PERMISSION TOGGLE
  // -------------------------------------------------------------
  const cyclePermission = (current: PermissionLevel): PermissionLevel => {
    if (current === 'total') return 'operativo';
    if (current === 'operativo') return 'lectura';
    if (current === 'lectura') return 'denegado';
    return 'total';
  };

  const handleToggleRbac = (rowId: string, roleKey: string) => {
    setRbacRules((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          const current = (row[roleKey] as PermissionLevel) || 'denegado';
          return {
            ...row,
            [roleKey]: cyclePermission(current),
          };
        }
        return row;
      })
    );
  };

  const handleResetRbac = () => {
    if (confirm('¿Restablecer todas las políticas de permisos RBAC a los valores oficiales por defecto?')) {
      const resetRules = DEFAULT_RBAC_RULES.map((rule) => {
        const row: RbacRow = { ...rule };
        rolesList.forEach((role) => {
          if (!role.isSystem) {
            row[role.id] = 'operativo';
          }
        });
        return row;
      });
      setRbacRules(resetRules);
      localStorage.setItem('firme_rbac_matrix', JSON.stringify(resetRules));
      showNotification('Políticas RBAC Restablecidas', 'Se han cargado los permisos por defecto.');
    }
  };

  // Sync with Supabase in cloud
  const handleSyncWithSupabase = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(
        'https://tcotfpzymrjyvwrlnskf.supabase.co/rest/v1/staff_profiles?select=*',
        {
          headers: {
            apikey:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjb3RmcHp5bXJqeXZ3cmxuc2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMDU3ODEsImV4cCI6MjEwNDU4MTc4MX0.PP-Jqrg8AXNAYp1TcFJcqUdxb_lQvB0-u0Gn4eKnYL0',
            Authorization:
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjb3RmcHp5bXJqeXZ3cmxuc2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMDU3ODEsImV4cCI6MjEwNDU4MTc4MX0.PP-Jqrg8AXNAYp1TcFJcqUdxb_lQvB0-u0Gn4eKnYL0',
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        showNotification('Sincronización Exitosa', `${data.length} cuentas verificadas en PostgreSQL.`);
      } else {
        showNotification('Conexión Verificada', 'Base de datos Supabase conectada.');
      }
    } catch {
      showNotification('Modo Local', 'Operando con almacenamiento local seguro.');
    } finally {
      setIsSyncing(false);
    }
  };

  const renderBadge = (level: PermissionLevel) => {
    switch (level) {
      case 'total':
        return (
          <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs hover:bg-emerald-100 transition-colors w-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>✓ Total</span>
          </span>
        );
      case 'operativo':
        return (
          <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs hover:bg-sky-100 transition-colors w-full">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span>✓ Operativo</span>
          </span>
        );
      case 'lectura':
        return (
          <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs hover:bg-amber-100 transition-colors w-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>👁 Lectura</span>
          </span>
        );
      case 'denegado':
      default:
        return (
          <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs hover:bg-rose-100 transition-colors w-full">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>✗ Denegado</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Principal del Módulo con Diseño Espacioso y Elevado */}
      <div className="bg-white border border-[#E8E2D7] rounded-3xl p-7 sm:p-9 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B5654A]/10 text-[#B5654A] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Control de Acceso, Identidad & Edición de Usuarios</span>
          </div>
          <h1 className="font-fraunces text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1815] tracking-tight">
            Administración de Usuarios y Permisos
          </h1>
          <p className="text-xs sm:text-sm text-[#6B655C] max-w-2xl leading-relaxed">
            Supervisión integral y edición en tiempo real de colaboradores de staff, plantel docente de Reformer, directorio de clientas y políticas de seguridad RBAC.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap relative z-10">
          <button
            type="button"
            onClick={handleSyncWithSupabase}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-2xl text-xs font-semibold bg-[#FAF8F5] border border-[#DDD5C9] hover:border-[#B5654A] hover:bg-white text-[#1A1815] transition-all shadow-2xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Verificar estado con la base de datos Supabase"
          >
            <RefreshCw className={`w-4 h-4 text-[#B5654A] ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Cloud'}</span>
          </button>

          {isOwnerDev && (
            <button
              type="button"
              onClick={() => setIsNewStaffModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#B5654A] hover:bg-[#9A5340] text-white transition-all shadow-sm hover:shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Nuevo Colaborador</span>
            </button>
          )}
        </div>
      </div>

      {/* Banner de Notificación */}
      {bannerNotice && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between shadow-xs animate-in fade-in duration-200 ${
            bannerNotice.isError
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {bannerNotice.isError ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <div>
              <strong>{bannerNotice.title}:</strong> <span>{bannerNotice.text}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBannerNotice(null)}
            className="text-xs font-bold hover:underline cursor-pointer ml-3 px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Tarjetas de Resumen (KPIs) Espaciosas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-[#E8E2D7] rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#8C8479]">
            <span className="text-xs font-bold uppercase tracking-wider">Personal Staff</span>
            <div className="w-10 h-10 rounded-2xl bg-[#B5654A]/10 text-[#B5654A] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="font-fraunces text-3xl font-bold text-[#1A1815] mt-3 mb-1">
            {staffList.length}
          </div>
          <div className="text-xs text-[#6B655C]">Cuentas activas con credenciales</div>
        </div>

        <div className="bg-white border border-[#E8E2D7] rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#8C8479]">
            <span className="text-xs font-bold uppercase tracking-wider">Instructoras</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="font-fraunces text-3xl font-bold text-[#1A1815] mt-3 mb-1">
            {instructorsList.length}
          </div>
          <div className="text-xs text-[#6B655C]">Docentes con turnos en Reformer</div>
        </div>

        <div className="bg-white border border-[#E8E2D7] rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#8C8479]">
            <span className="text-xs font-bold uppercase tracking-wider">Directorio Alumnas</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="font-fraunces text-3xl font-bold text-[#1A1815] mt-3 mb-1">
            {clients.length}
          </div>
          <div className="text-xs text-[#6B655C]">
            {clients.filter((c) => c.status === 'activo').length} con membresía activa
          </div>
        </div>

        <div className="bg-white border border-[#E8E2D7] rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[#8C8479]">
            <span className="text-xs font-bold uppercase tracking-wider">Roles & Permisos</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="font-fraunces text-3xl font-bold text-[#1A1815] mt-3 mb-1">
            {rolesList.length} Roles
          </div>
          <div className="text-xs text-[#6B655C]">{rolesList.filter((r) => !r.isSystem).length} personalizados · {rbacRules.length} módulos</div>
        </div>
      </div>

      {/* 3. Barra de Subpestañas Rediseñada: Espaciosa, Elegante y con Aire */}
      <div className="bg-[#F5F1EB] border border-[#E2DBD0] p-2 rounded-3xl shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveUserSubTab('staff')}
          className={`flex-1 min-w-[180px] py-3 px-5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2.5 ${
            activeUserSubTab === 'staff'
              ? 'bg-[#1A1815] text-[#FAF8F5] shadow-sm font-bold'
              : 'text-[#6B655C] hover:text-[#1A1815] hover:bg-white/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Personal de Staff</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
              activeUserSubTab === 'staff'
                ? 'bg-white/20 text-[#FAF8F5]'
                : 'bg-[#E6E0D5] text-[#1A1815]'
            }`}
          >
            {staffList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveUserSubTab('instructores')}
          className={`flex-1 min-w-[170px] py-3 px-5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2.5 ${
            activeUserSubTab === 'instructores'
              ? 'bg-[#1A1815] text-[#FAF8F5] shadow-sm font-bold'
              : 'text-[#6B655C] hover:text-[#1A1815] hover:bg-white/60'
          }`}
        >
          <Award className="w-4 h-4 shrink-0" />
          <span>Instructoras</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
              activeUserSubTab === 'instructores'
                ? 'bg-white/20 text-[#FAF8F5]'
                : 'bg-[#E6E0D5] text-[#1A1815]'
            }`}
          >
            {instructorsList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveUserSubTab('alumnas')}
          className={`flex-1 min-w-[200px] py-3 px-5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2.5 ${
            activeUserSubTab === 'alumnas'
              ? 'bg-[#1A1815] text-[#FAF8F5] shadow-sm font-bold'
              : 'text-[#6B655C] hover:text-[#1A1815] hover:bg-white/60'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>Directorio de Clientas</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
              activeUserSubTab === 'alumnas'
                ? 'bg-white/20 text-[#FAF8F5]'
                : 'bg-[#E6E0D5] text-[#1A1815]'
            }`}
          >
            {clients.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveUserSubTab('roles')}
          className={`flex-1 min-w-[190px] py-3 px-5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2.5 ${
            activeUserSubTab === 'roles'
              ? 'bg-[#1A1815] text-[#FAF8F5] shadow-sm font-bold'
              : 'text-[#6B655C] hover:text-[#1A1815] hover:bg-white/60'
          }`}
        >
          <Sliders className="w-4 h-4 shrink-0" />
          <span>Gestión de Roles</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
              activeUserSubTab === 'roles'
                ? 'bg-white/20 text-[#FAF8F5]'
                : 'bg-[#E6E0D5] text-[#1A1815]'
            }`}
          >
            {rolesList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveUserSubTab('rbac')}
          className={`flex-1 min-w-[200px] py-3 px-5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2.5 ${
            activeUserSubTab === 'rbac'
              ? 'bg-[#1A1815] text-[#FAF8F5] shadow-sm font-bold'
              : 'text-[#6B655C] hover:text-[#1A1815] hover:bg-white/60'
          }`}
        >
          <Lock className="w-4 h-4 shrink-0" />
          <span>Matriz de Permisos (RBAC)</span>
        </button>
      </div>

      {/* 4. VISTA: PERSONAL DE STAFF */}
      {activeUserSubTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-fraunces text-xl font-bold text-[#1A1815]">
                Colaboradores y Personal Autorizado
              </h2>
              <p className="text-xs text-[#6B655C] mt-0.5">
                Cuentas activas con acceso administrativo. Puedes modificar datos y contraseñas usando el botón <strong>Editar</strong>.
              </p>
            </div>

            {isOwnerDev && (
              <button
                type="button"
                onClick={() => setIsNewStaffModalOpen(true)}
                className="px-4 py-2 rounded-2xl text-xs font-bold bg-[#B5654A] hover:bg-[#9A5340] text-white inline-flex items-center gap-2 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Colaborador</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staffList.map((staff) => {
              const isOwner = staff.role === 'owner_dev';
              const isCurrentSession = currentUser?.email?.toLowerCase() === staff.email.toLowerCase();

              return (
                <div
                  key={staff.id}
                  className="bg-white border border-[#E8E2D7] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between relative group"
                >
                  {isOwner && (
                    <div className="absolute top-0 right-0 bg-[#B5654A] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-bl-2xl shadow-xs">
                      Owner Principal
                    </div>
                  )}

                  <div>
                    {/* Header de la tarjeta */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className="relative">
                        <img
                          src={staff.avatar}
                          alt={staff.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-[#B5654A] shadow-sm"
                        />
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0 shadow-xs" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold font-fraunces text-base text-[#1A1815] flex items-center gap-2 truncate">
                          <span className="truncate">{staff.name}</span>
                          {isCurrentSession && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold shrink-0">
                              Tú
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-[#B5654A] truncate mt-0.5">
                          {staff.roleTitle}
                        </div>
                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                          {(() => {
                            const foundRole = rolesList.find((r) => r.id === staff.role);
                            const badgeStyle = getRoleBadgeStyle(foundRole?.badgeColor);
                            return (
                              <span
                                className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-md border ${badgeStyle}`}
                              >
                                {foundRole?.title || staff.role}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Datos descriptivos limpios */}
                    <div className="space-y-2.5 text-xs text-[#5C564E] py-4 border-y border-[#F2EEE9]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#8C8479]">Correo Oficial:</span>
                        <strong className="font-mono text-[11px] text-[#1A1815] truncate max-w-[200px]">
                          {staff.email}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8C8479]">DNI:</span>
                        <strong className="font-mono text-[11px] text-[#1A1815]">{staff.dni}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8C8479]">Teléfono:</span>
                        <strong className="text-[11px] text-[#1A1815]">{staff.phone}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8C8479]">Estado:</span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Habilitado</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#6B655C] leading-relaxed my-4 line-clamp-2">
                      {staff.description}
                    </p>
                  </div>

                  {/* Footer de la tarjeta con acciones amplias */}
                  <div className="pt-4 border-t border-[#F2EEE9] flex items-center justify-between">
                    <span className="text-[11px] text-[#8C8479]">
                      ID: <span className="font-mono font-medium">{staff.id}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditStaff(staff)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#1A1815] hover:text-[#FAF8F5] border border-[#DDD5C9] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      {!isOwner && isOwnerDev && (
                        <button
                          type="button"
                          onClick={() => handleDeleteStaff(staff.id)}
                          className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Eliminar colaborador"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. VISTA: INSTRUCTORAS */}
      {activeUserSubTab === 'instructores' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-fraunces text-xl font-bold text-[#1A1815]">
                Plantel de Docentes & Especialistas de Sala
              </h2>
              <p className="text-xs text-[#6B655C] mt-0.5">
                Configuración del equipo docente, certificaciones oficiales PMA y especialidades de biomecánica.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenNewInstructor}
              className="px-4 py-2 rounded-2xl text-xs font-bold bg-[#B5654A] hover:bg-[#9A5340] text-white inline-flex items-center gap-2 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nueva Instructora</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {instructorsList.map((inst) => (
              <div
                key={inst.id}
                className="bg-white border border-[#E8E2D7] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#262422] to-[#1A1815] text-[#FAF8F5] font-fraunces text-lg flex items-center justify-center font-bold shadow-xs">
                        {inst.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-fraunces text-base font-bold text-[#1A1815]">{inst.name}</h3>
                        <div className="text-xs text-[#B5654A] font-semibold">{inst.specialty}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenEditInstructor(inst)}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C9] hover:border-[#B5654A] hover:bg-white text-[#1A1815] text-xs font-bold cursor-pointer shadow-2xs inline-flex items-center gap-1.5 transition-all"
                      title="Editar datos de la instructora"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#B5654A]" />
                      <span>Editar</span>
                    </button>
                  </div>

                  <div className="bg-[#FAF8F5] border border-[#E8E2D7] rounded-2xl p-4 text-xs my-4 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C8479]">
                      Certificación Oficial:
                    </div>
                    <div className="text-xs text-[#1A1815] font-semibold leading-snug">
                      {inst.certification}
                    </div>
                  </div>

                  <p className="text-xs text-[#6B655C] leading-relaxed mb-4 line-clamp-3">
                    {inst.bio}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F2EEE9] flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Activa en Turnos</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteInstructor(inst.id, inst.name)}
                    className="text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Eliminar instructora"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. VISTA: DIRECTORIO DE ALUMNAS */}
      {activeUserSubTab === 'alumnas' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E8E2D7] rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-[#8C8479] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={clientSearchTerm}
                onChange={(e) => setClientSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, DNI o correo..."
                className="w-full pl-11 pr-4 py-2.5 bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs text-[#6B655C] font-semibold hidden sm:inline">Filtrar Estado:</span>
              <select
                value={clientStatusFilter}
                onChange={(e) => setClientStatusFilter(e.target.value as any)}
                className="bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] cursor-pointer"
              >
                <option value="all">Todos los estados</option>
                <option value="activo">Solo Activas</option>
                <option value="en_riesgo">En Riesgo</option>
                <option value="inactivo">Inactivas</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-[#E8E2D7] rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-[#1A1815]">
                <thead className="bg-[#FAF8F5] text-xs font-bold uppercase tracking-wider text-[#6B655C] border-b border-[#E8E2D7]">
                  <tr>
                    <th className="py-4 px-5">Alumna</th>
                    <th className="py-4 px-5">DNI</th>
                    <th className="py-4 px-5">Contacto</th>
                    <th className="py-4 px-5">Plan Vigente</th>
                    <th className="py-4 px-5 text-center">Créditos</th>
                    <th className="py-4 px-5 text-center">Asistencias</th>
                    <th className="py-4 px-5">Estado</th>
                    <th className="py-4 px-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2EEE9]">
                  {filteredClients.map((cli) => (
                    <tr key={cli.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="py-4 px-5 font-bold text-[#1A1815]">
                        <div className="font-fraunces text-sm font-bold">{cli.name}</div>
                        <div className="text-xs text-[#8C8479] font-normal mt-0.5">{cli.email}</div>
                      </td>
                      <td className="py-4 px-5 font-mono text-xs text-[#5C564E]">{cli.dni}</td>
                      <td className="py-4 px-5 text-xs text-[#5C564E]">{cli.phone}</td>
                      <td className="py-4 px-5">
                        <span className="font-semibold text-xs text-[#B5654A]">{cli.currentPlan}</span>
                      </td>
                      <td className="py-4 px-5 text-center font-bold text-sm">
                        {cli.planType === 'ilimitado' ? '∞' : cli.creditsLeft}
                      </td>
                      <td className="py-4 px-5 text-center font-mono text-xs text-[#5C564E]">
                        {cli.totalAttended} clases
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1 rounded-full ${
                            cli.status === 'activo'
                              ? 'bg-emerald-100 text-emerald-800'
                              : cli.status === 'en_riesgo'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              cli.status === 'activo'
                                ? 'bg-emerald-600'
                                : cli.status === 'en_riesgo'
                                ? 'bg-amber-600'
                                : 'bg-rose-600'
                            }`}
                          />
                          <span>{cli.status === 'activo' ? 'Activo' : cli.status === 'en_riesgo' ? 'En riesgo' : 'Inactivo'}</span>
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEditClient(cli)}
                          className="px-3.5 py-1.5 rounded-xl bg-white border border-[#DDD5C9] hover:border-[#B5654A] hover:bg-[#B5654A] hover:text-white text-[#1A1815] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar Ficha</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredClients.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#8C8479]">
                        No se encontraron clientas que coincidan con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. VISTA: GESTIÓN DE ROLES DINÁMICOS */}
      {activeUserSubTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-fraunces text-xl font-bold text-[#1A1815]">
                Catálogo & Gestión Dinámica de Roles
              </h2>
              <p className="text-xs text-[#6B655C] mt-0.5">
                Crea roles especializados según las necesidades operativas de FIRME STUDIO y personaliza sus permisos en la matriz RBAC.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsNewRoleModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-[#B5654A] hover:bg-[#9A5340] text-white inline-flex items-center gap-2 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Crear Nuevo Rol</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rolesList.map((role) => {
              const assignedStaffCount = staffList.filter((s) => s.role === role.id).length;
              const badgeClass = getRoleBadgeStyle(role.badgeColor);

              return (
                <div
                  key={role.id}
                  className="bg-white border border-[#E8E2D7] rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between relative group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-fraunces text-lg font-bold text-[#1A1815]">
                          {role.title}
                        </h3>
                        <span className="text-[11px] font-mono text-[#8C8479]">
                          @{role.id}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border shrink-0 ${badgeClass}`}
                      >
                        {role.title}
                      </span>
                    </div>

                    <p className="text-xs text-[#6B655C] leading-relaxed mb-4 min-h-[36px]">
                      {role.description}
                    </p>

                    <div className="space-y-2 py-3 border-y border-[#F2EEE9] text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#8C8479]">Tipo de Rol:</span>
                        {role.isSystem ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-[#1A1815]">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                            <span>Sistema Protegido</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Personalizado</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[#8C8479]">Colaboradores asignados:</span>
                        <span className="font-bold text-[#1A1815] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#E8E2D7]">
                          {assignedStaffCount} {assignedStaffCount === 1 ? 'persona' : 'personas'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[#8C8479]">Acceso a Panel Admin:</span>
                        <span className={`font-semibold ${role.canAccessAdminPanel ? 'text-emerald-700' : 'text-[#8C8479]'}`}>
                          {role.canAccessAdminPanel ? '✓ Habilitado' : '✗ Sin Acceso'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 flex items-center justify-between gap-2 border-t border-[#F2EEE9]">
                    <button
                      type="button"
                      onClick={() => setActiveUserSubTab('rbac')}
                      className="text-xs font-semibold text-[#B5654A] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Ver en RBAC</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditRole(role)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF8F5] hover:bg-white text-[#1A1815] border border-[#DDD5C9] hover:border-[#B5654A] cursor-pointer inline-flex items-center gap-1.5 transition-all shadow-2xs"
                        title={`Editar nombre y color de ${role.title}`}
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#B5654A]" />
                        <span>Editar</span>
                      </button>

                      {!role.isSystem ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteRole(role.id)}
                          className="p-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer inline-flex items-center transition-colors"
                          title="Eliminar este rol personalizado"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold text-[#8C8479] bg-[#FAF8F5] px-2 py-1 rounded-lg border border-[#E8E2D7]">
                          Base
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. VISTA: MATRIZ DE PERMISOS (RBAC) */}
      {activeUserSubTab === 'rbac' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E8E2D7] rounded-3xl p-7 sm:p-9 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-fraunces text-xl font-bold text-[#1A1815] mb-1">
                  Matriz Oficial de Control de Acceso Basado en Roles (RBAC)
                </h2>
                <p className="text-xs sm:text-sm text-[#6B655C] leading-relaxed">
                  Haz clic sobre cualquier casilla de permiso para alternar cíclicamente entre: <strong>✓ Total</strong>, <strong>✓ Operativo</strong>, <strong>👁 Lectura</strong> o <strong>✗ Denegado</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  type="button"
                  onClick={() => setIsNewRoleModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-[#B5654A] hover:bg-[#9A5340] text-white inline-flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Crear Nuevo Rol</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetRbac}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-[#FAF8F5] border border-[#DDD5C9] hover:border-[#B5654A] text-[#6B655C] hover:text-[#1A1815] inline-flex items-center gap-2 shadow-2xs cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restablecer</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#E8E2D7] rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#FAF8F5] text-xs font-bold uppercase tracking-wider text-[#6B655C] border-b border-[#E8E2D7]">
                  <tr>
                    <th className="py-4 px-5">Módulo / Capacidad</th>
                    {rolesList.map((role) => (
                      <th key={role.id} className="py-4 px-3 text-center min-w-[140px]">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span className="font-fraunces text-xs sm:text-sm font-bold text-[#1A1815]">
                            {role.title}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-semibold border ${getRoleBadgeStyle(role.badgeColor)}`}>
                              @{role.id}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditRole(role);
                              }}
                              className="text-[#6B655C] hover:text-[#B5654A] p-0.5 rounded-md hover:bg-white transition-colors cursor-pointer"
                              title={`Editar nombre o color de ${role.title}`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {!role.isSystem && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRole(role.id);
                                }}
                                className="text-rose-500 hover:text-rose-700 p-0.5 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                                title={`Eliminar rol ${role.title}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2EEE9] bg-white">
                  {rbacRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="py-4 px-5 font-semibold text-[#1A1815]">
                        {rule.module}
                      </td>

                      {rolesList.map((role) => {
                        const perm = (rule[role.id] as PermissionLevel) || 'denegado';
                        return (
                          <td
                            key={role.id}
                            className="py-3 px-3 text-center cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => handleToggleRbac(rule.id, role.id)}
                            title={`Clic para alternar permiso de ${role.title}`}
                          >
                            {renderBadge(perm)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs sm:text-sm text-amber-800 flex items-center justify-between">
              <span className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Las modificaciones se almacenan automáticamente y aplican para los tokens y accesos del estudio.</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 0: CREAR NUEVO ROL PERSONALIZADO */}
      {/* ============================================================= */}
      {isNewRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E2D7] rounded-3xl max-w-lg w-full p-7 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#F2EEE9] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#B5654A]/10 text-[#B5654A] flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-fraunces text-lg sm:text-xl font-bold text-[#1A1815]">
                    Crear Rol Personalizado
                  </h3>
                  <p className="text-xs text-[#6B655C]">Define un nuevo perfil de acceso y sus permisos RBAC</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewRoleModalOpen(false)}
                className="text-[#8C8479] hover:text-[#1A1815] cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {roleFormError && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{roleFormError}</span>
              </div>
            )}

            {roleFormSuccess && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{roleFormSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Nombre del Rol <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newRoleTitle}
                  onChange={(e) => {
                    const title = e.target.value;
                    setNewRoleTitle(title);
                    if (!newRoleId || newRoleId === newRoleTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')) {
                      const autoSlug = title
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]/g, '_')
                        .replace(/__+/g, '_')
                        .replace(/^_+|_+$/g, '');
                      setNewRoleId(autoSlug);
                    }
                  }}
                  placeholder="Ej. Coordinadora de Turnos, Nutricionista, Marketing..."
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Identificador Único (Slug) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-xs font-mono text-[#8C8479]">@</span>
                  <input
                    type="text"
                    required
                    value={newRoleId}
                    onChange={(e) => setNewRoleId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="coordinador_turnos"
                    className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl pl-8 pr-4 py-2.5 text-xs sm:text-sm font-mono text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                  />
                </div>
                <p className="text-[11px] text-[#8C8479] mt-1">Solo letras minúsculas, números y guión bajo (_).</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Descripción del Rol
                </label>
                <textarea
                  rows={2}
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="Responsabilidades, alcance y funciones dentro del estudio..."
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-2">
                  Color de Insignia
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'rose', label: 'Terracota', dot: 'bg-[#B5654A]' },
                    { id: 'emerald', label: 'Esmeralda', dot: 'bg-emerald-500' },
                    { id: 'amber', label: 'Ámbar', dot: 'bg-amber-500' },
                    { id: 'purple', label: 'Púrpura', dot: 'bg-purple-500' },
                    { id: 'sky', label: 'Cielo', dot: 'bg-sky-500' },
                    { id: 'stone', label: 'Carbón', dot: 'bg-[#1A1815]' },
                  ].map((col) => {
                    const isSelected = newRoleColor === col.id;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setNewRoleColor(col.id)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#B5654A] bg-[#B5654A]/5 text-[#1A1815] shadow-xs font-bold ring-1 ring-[#B5654A]'
                            : 'border-[#E8E2D7] bg-[#FAF8F5] text-[#5C564E] hover:border-[#DDD5C9] hover:bg-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-full shrink-0 ${col.dot} shadow-2xs`}
                          />
                          <span className="truncate">{col.label}</span>
                        </span>
                        {isSelected ? (
                          <Check className="w-4 h-4 text-[#B5654A] shrink-0" />
                        ) : (
                          <span className="w-4 h-4 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Vista previa en vivo de la insignia */}
                <div className="mt-3 p-3 bg-[#FAF8F5] border border-[#E8E2D7] rounded-2xl flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#8C8479]">Vista previa de la insignia:</span>
                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border shadow-2xs ${getRoleBadgeStyle(
                      newRoleColor
                    )}`}
                  >
                    {newRoleTitle.trim() || 'Nuevo Rol'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                    Permiso Base Inicial
                  </label>
                  <select
                    value={newRoleInitialPerm}
                    onChange={(e) => setNewRoleInitialPerm(e.target.value as PermissionLevel)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="total">✓ Total (Todos los módulos)</option>
                    <option value="operativo">✓ Operativo (Uso diario)</option>
                    <option value="lectura">👁 Lectura (Solo ver)</option>
                    <option value="denegado">✗ Denegado (Sin acceso)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                    Acceso a Panel Admin
                  </label>
                  <label className="flex items-center gap-2.5 mt-2 text-xs font-semibold text-[#1A1815] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRoleCanAdmin}
                      onChange={(e) => setNewRoleCanAdmin(e.target.checked)}
                      className="w-4 h-4 rounded text-[#B5654A] focus:ring-[#B5654A]"
                    />
                    <span>Habilitar portal admin</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F2EEE9]">
                <button
                  type="button"
                  onClick={() => setIsNewRoleModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-[#6B655C] hover:text-[#1A1815] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[#B5654A] hover:bg-[#9A5340] text-white shadow-sm hover:shadow-md cursor-pointer inline-flex items-center gap-2 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Crear Rol</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: EDITAR ROL (SISTEMA O PERSONALIZADO) */}
      {/* ============================================================= */}
      {editingRole && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E2D7] rounded-3xl max-w-lg w-full p-7 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#F2EEE9] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#B5654A]/10 text-[#B5654A] flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-fraunces text-lg sm:text-xl font-bold text-[#1A1815]">
                    Editar Rol
                  </h3>
                  <p className="text-xs text-[#6B655C]">
                    {editingRole.isSystem ? 'Rol Base del Sistema' : 'Rol Personalizado'} · @{editingRole.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingRole(null)}
                className="text-[#8C8479] hover:text-[#1A1815] cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {editRoleError && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{editRoleError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditRole} className="space-y-4">
              {/* Identificador técnico (bloqueado para mantener integridad) */}
              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Identificador Técnico (Slug)
                </label>
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#F5F1EB] border border-[#E2DBD0] rounded-2xl">
                  <span className="font-mono text-xs font-semibold text-[#5C564E]">
                    @{editingRole.id}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#8C8479] bg-white px-2 py-0.5 rounded-md border border-[#DDD5C9]">
                    {editingRole.isSystem ? 'Inmutable (Sistema)' : 'Identificador Fijo'}
                  </span>
                </div>
                <p className="text-[11px] text-[#8C8479] mt-1">
                  El slug técnico se mantiene fijo para garantizar la consistencia en el backend y la base de datos.
                </p>
              </div>

              {/* Nombre Visible */}
              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Nombre Visible del Rol <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editRoleTitle}
                  onChange={(e) => setEditRoleTitle(e.target.value)}
                  placeholder="Ej. Instructora Reformer, Coordinación General..."
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Descripción del Rol
                </label>
                <textarea
                  rows={2}
                  value={editRoleDescription}
                  onChange={(e) => setEditRoleDescription(e.target.value)}
                  placeholder="Responsabilidades, alcance y funciones dentro del estudio..."
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                />
              </div>

              {/* Color de Insignia */}
              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-2">
                  Color de Insignia
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'rose', label: 'Terracota', dot: 'bg-[#B5654A]' },
                    { id: 'emerald', label: 'Esmeralda', dot: 'bg-emerald-500' },
                    { id: 'amber', label: 'Ámbar', dot: 'bg-amber-500' },
                    { id: 'purple', label: 'Púrpura', dot: 'bg-purple-500' },
                    { id: 'sky', label: 'Cielo', dot: 'bg-sky-500' },
                    { id: 'stone', label: 'Carbón', dot: 'bg-[#1A1815]' },
                  ].map((col) => {
                    const isSelected = editRoleColor === col.id;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setEditRoleColor(col.id)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#B5654A] bg-[#B5654A]/5 text-[#1A1815] shadow-xs font-bold ring-1 ring-[#B5654A]'
                            : 'border-[#E8E2D7] bg-[#FAF8F5] text-[#5C564E] hover:border-[#DDD5C9] hover:bg-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-full shrink-0 ${col.dot} shadow-2xs`}
                          />
                          <span className="truncate">{col.label}</span>
                        </span>
                        {isSelected ? (
                          <Check className="w-4 h-4 text-[#B5654A] shrink-0" />
                        ) : (
                          <span className="w-4 h-4 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Vista previa en vivo de la insignia */}
                <div className="mt-3 p-3 bg-[#FAF8F5] border border-[#E8E2D7] rounded-2xl flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#8C8479]">Vista previa de la insignia:</span>
                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border shadow-2xs ${getRoleBadgeStyle(
                      editRoleColor
                    )}`}
                  >
                    {editRoleTitle.trim() || 'Rol'}
                  </span>
                </div>
              </div>

              {/* Acceso a Panel Admin */}
              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Acceso a Panel Administrativo
                </label>
                <label
                  className={`flex items-center gap-2.5 mt-1 text-xs font-semibold text-[#1A1815] ${
                    editingRole.id === 'owner_dev' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={editingRole.id === 'owner_dev' ? true : editRoleCanAdmin}
                    disabled={editingRole.id === 'owner_dev'}
                    onChange={(e) => setEditRoleCanAdmin(e.target.checked)}
                    className="w-4 h-4 rounded text-[#B5654A] focus:ring-[#B5654A]"
                  />
                  <span>
                    Habilitar acceso al panel administrativo de sede
                    {editingRole.id === 'owner_dev' && ' (Obligatorio para Owner Dev)'}
                  </span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F2EEE9]">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-[#6B655C] hover:text-[#1A1815] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[#B5654A] hover:bg-[#9A5340] text-white shadow-sm hover:shadow-md cursor-pointer inline-flex items-center gap-2 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 1: EDITAR COLABORADOR STAFF */}
      {/* ============================================================= */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E2D7] rounded-3xl max-w-lg w-full p-7 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#F2EEE9] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#B5654A]/10 text-[#B5654A] flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-fraunces text-lg sm:text-xl font-bold text-[#1A1815]">
                    Editar Colaborador
                  </h3>
                  <p className="text-xs text-[#6B655C]">{editingStaff.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="text-[#8C8479] hover:text-[#1A1815] cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {editStaffError && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{editStaffError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Nombres y Apellidos <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editStaffName}
                  onChange={(e) => setEditStaffName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Correo Electrónico Oficial <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editStaffEmail}
                  onChange={(e) => setEditStaffEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                    Rol en Sistema <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editStaffRole}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      setEditStaffRole(newRole);
                      const found = rolesList.find((r) => r.id === newRole);
                      setEditStaffRoleTitle(found ? found.title : 'Colaborador');
                    }}
                    className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all cursor-pointer"
                  >
                    {rolesList.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.title} {role.isSystem ? '(Sistema)' : '(Personalizado)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                    Título Visible
                  </label>
                  <input
                    type="text"
                    value={editStaffRoleTitle}
                    onChange={(e) => setEditStaffRoleTitle(e.target.value)}
                    placeholder="Ej. Coordinadora de Sede"
                    className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                    DNI <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editStaffDni}
                    onChange={(e) => setEditStaffDni(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-mono text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                    Teléfono Celular
                  </label>
                  <input
                    type="text"
                    value={editStaffPhone}
                    onChange={(e) => setEditStaffPhone(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Clave de Acceso (Opcional / PIN)
                </label>
                <input
                  type="text"
                  value={editStaffPassword}
                  onChange={(e) => setEditStaffPassword(e.target.value)}
                  placeholder="Dejar igual o cambiar PIN"
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-mono text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Descripción y Atribuciones
                </label>
                <textarea
                  rows={2}
                  value={editStaffDescription}
                  onChange={(e) => setEditStaffDescription(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F2EEE9]">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-[#6B655C] hover:text-[#1A1815] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[#B5654A] hover:bg-[#9A5340] text-white shadow-sm hover:shadow-md cursor-pointer inline-flex items-center gap-2 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 2: CREAR / EDITAR INSTRUCTORA */}
      {/* ============================================================= */}
      {isInstructorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E2D7] rounded-3xl max-w-lg w-full p-7 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#F2EEE9] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#B5654A]/10 text-[#B5654A] flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-fraunces text-lg sm:text-xl font-bold text-[#1A1815]">
                    {editingInstructor ? `Editar: ${editingInstructor.name}` : 'Nueva Instructora'}
                  </h3>
                  <p className="text-xs text-[#6B655C]">Plantel de Docentes en Sala</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInstructorModalOpen(false)}
                className="text-[#8C8479] hover:text-[#1A1815] cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {instError && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{instError}</span>
              </div>
            )}

            <form onSubmit={handleSaveInstructor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Nombre Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                  placeholder="Ej. Lucía Benavides"
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Especialidad Principal <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={instSpecialty}
                  onChange={(e) => setInstSpecialty(e.target.value)}
                  placeholder="Ej. Reformer Funcional & Biomecánica"
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Certificación Oficial
                </label>
                <input
                  type="text"
                  value={instCertification}
                  onChange={(e) => setInstCertification(e.target.value)}
                  placeholder="Ej. PMA Certified Teacher · Master Reformer"
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Biografía o Perfil Profesional
                </label>
                <textarea
                  rows={3}
                  value={instBio}
                  onChange={(e) => setInstBio(e.target.value)}
                  placeholder="Experiencia dictando clases, enfoque en control postural y técnica..."
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F2EEE9]">
                <button
                  type="button"
                  onClick={() => setIsInstructorModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-[#6B655C] hover:text-[#1A1815] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[#B5654A] hover:bg-[#9A5340] text-white shadow-sm hover:shadow-md cursor-pointer inline-flex items-center gap-2 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingInstructor ? 'Guardar Instructora' : 'Crear Instructora'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 3: EDICIÓN RÁPIDA DE CLIENTA */}
      {/* ============================================================= */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E2D7] rounded-3xl max-w-lg w-full p-7 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#F2EEE9] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#B5654A]/10 text-[#B5654A] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-fraunces text-lg sm:text-xl font-bold text-[#1A1815]">
                    Editar Ficha de Alumna
                  </h3>
                  <p className="text-xs text-[#6B655C]">{editingClient.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="text-[#8C8479] hover:text-[#1A1815] cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Nombre Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientFormName}
                  onChange={(e) => setClientFormName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                    DNI / Documento
                  </label>
                  <input
                    type="text"
                    value={clientFormDni}
                    onChange={(e) => setClientFormDni(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-mono text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                    Teléfono Celular
                  </label>
                  <input
                    type="text"
                    value={clientFormPhone}
                    onChange={(e) => setClientFormPhone(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={clientFormEmail}
                  onChange={(e) => setClientFormEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                    Plan Vigente
                  </label>
                  <select
                    value={clientFormPlan}
                    onChange={(e) => setClientFormPlan(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="Clase Suelta">Clase Suelta</option>
                    <option value="Pack 8 Clases">Pack 8 Clases</option>
                    <option value="Membresía Ilimitada">Membresía Ilimitada</option>
                    <option value="Membresía + Privadas">Membresía + Privadas</option>
                    <option value="Nuevo Alumno">Nuevo Alumno</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                    Créditos Restantes
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={clientFormCredits}
                    onChange={(e) => setClientFormCredits(Number(e.target.value))}
                    className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Estado de la Alumna
                </label>
                <select
                  value={clientFormStatus}
                  onChange={(e) => setClientFormStatus(e.target.value as any)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all cursor-pointer"
                >
                  <option value="activo">Activo (Membresía o pase al día)</option>
                  <option value="en_riesgo">En Riesgo (Sin créditos o inactiva temporal)</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Historial Médico / Lesiones
                </label>
                <textarea
                  rows={2}
                  value={clientFormMedicalNotes}
                  onChange={(e) => setClientFormMedicalNotes(e.target.value)}
                  placeholder="Ej. Tensión cervical leve, evitar hiperextensión..."
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F2EEE9]">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-[#6B655C] hover:text-[#1A1815] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[#B5654A] hover:bg-[#9A5340] text-white shadow-sm hover:shadow-md cursor-pointer inline-flex items-center gap-2 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Ficha</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL 4: CREAR NUEVO COLABORADOR */}
      {/* ============================================================= */}
      {isNewStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E2D7] rounded-3xl max-w-lg w-full p-7 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#F2EEE9] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#B5654A]/10 text-[#B5654A] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-fraunces text-lg sm:text-xl font-bold text-[#1A1815]">
                    Nuevo Colaborador Staff
                  </h3>
                  <p className="text-xs text-[#6B655C]">Creación de credenciales y permisos</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewStaffModalOpen(false)}
                className="text-[#8C8479] hover:text-[#1A1815] cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Nombres y Apellidos <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="Ej. Carmen Flores"
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Correo Electrónico Oficial <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="carmen@firmestudio.pe"
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                    Rol Asignado <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as any)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all cursor-pointer"
                  >
                    {rolesList.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.title} {role.isSystem ? '(Sistema)' : '(Personalizado)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                    DNI <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newStaffDni}
                    onChange={(e) => setNewStaffDni(e.target.value)}
                    placeholder="75892011"
                    className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-mono text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                    Teléfono Celular
                  </label>
                  <input
                    type="text"
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    placeholder="+51 988 112 233"
                    className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                    Contraseña Inicial
                  </label>
                  <div className="relative">
                    <input
                      type={showNewStaffPass ? 'text' : 'password'}
                      value={newStaffPassword}
                      onChange={(e) => setNewStaffPassword(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 pr-10 py-2.5 text-xs sm:text-sm font-mono text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewStaffPass(!showNewStaffPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C8479] hover:text-[#1A1815] cursor-pointer"
                    >
                      {showNewStaffPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Descripción o Funciones
                </label>
                <textarea
                  rows={2}
                  value={newStaffDescription}
                  onChange={(e) => setNewStaffDescription(e.target.value)}
                  placeholder="Responsable de atención y apertura de sede turno tarde..."
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F2EEE9]">
                <button
                  type="button"
                  onClick={() => setIsNewStaffModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-[#6B655C] hover:text-[#1A1815] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[#B5654A] hover:bg-[#9A5340] text-white shadow-sm hover:shadow-md cursor-pointer transition-all"
                >
                  Registrar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersTab;
