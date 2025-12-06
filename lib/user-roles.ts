// Definição dos papéis de usuário no sistema multi-tenant
export enum UserRole {
  SuperAdmin = "super_admin", // Acesso global ao sistema, gerencia tenants
  Admin = "admin", // Administrador de um tenant específico (barbearia)
  Barber = "barber", // Barbeiro associado a uma barbearia
  Customer = "customer", // Cliente que agenda serviços
}

// Funções auxiliares para verificação de papéis
export const isAdmin = (role: string): boolean => {
  return role === UserRole.Admin || role === UserRole.SuperAdmin;
};

export const isSuperAdmin = (role: string): boolean => {
  return role === UserRole.SuperAdmin;
};

export const isBarber = (role: string): boolean => {
  return (
    role === UserRole.Barber ||
    role === UserRole.Admin ||
    role === UserRole.SuperAdmin
  );
};

export const isCustomer = (role: string): boolean => {
  return (
    role === UserRole.Customer ||
    role === UserRole.Barber ||
    role === UserRole.Admin ||
    role === UserRole.SuperAdmin
  );
};

// Funções específicas para o sistema fechado
export const canCreateAdmin = (role: string): boolean => {
  return role === UserRole.SuperAdmin;
};

export const canCreateBarber = (role: string): boolean => {
  return role === UserRole.SuperAdmin || role === UserRole.Admin;
};

// Definições de permissões por papel
export interface Permissions {
  canManageUsers: boolean;
  canCreateAdmins: boolean;
  canCreateBarbers: boolean;
  canManageServices: boolean;
  canManageAppointments: boolean;
  canViewReports: boolean;
  canManageTenant: boolean;
}

export const getPermissions = (role: UserRole): Permissions => {
  switch (role) {
    case UserRole.SuperAdmin:
      return {
        canManageUsers: true,
        canCreateAdmins: true,
        canCreateBarbers: true,
        canManageServices: true,
        canManageAppointments: true,
        canViewReports: true,
        canManageTenant: true,
      };
    case UserRole.Admin:
      return {
        canManageUsers: true,
        canCreateAdmins: false, // Apenas super admin pode criar admins
        canCreateBarbers: true,
        canManageServices: true,
        canManageAppointments: true,
        canViewReports: true,
        canManageTenant: false, // Admin não pode gerenciar o tenant em nível global
      };
    case UserRole.Barber:
      return {
        canManageUsers: false,
        canCreateAdmins: false,
        canCreateBarbers: false,
        canManageServices: false,
        canManageAppointments: true, // Apenas seus próprios agendamentos
        canViewReports: false,
        canManageTenant: false,
      };
    case UserRole.Customer:
      return {
        canManageUsers: false,
        canCreateAdmins: false,
        canCreateBarbers: false,
        canManageServices: false,
        canManageAppointments: true, // Apenas seus próprios agendamentos
        canViewReports: false,
        canManageTenant: false,
      };
    default:
      return {
        canManageUsers: false,
        canCreateAdmins: false,
        canCreateBarbers: false,
        canManageServices: false,
        canManageAppointments: false,
        canViewReports: false,
        canManageTenant: false,
      };
  }
};
