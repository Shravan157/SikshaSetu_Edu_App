export const ROLES = {
  ADMIN: 'ADMIN',
  FACULTY: 'FACULTY',
  STUDENT: 'STUDENT',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.FACULTY]: 'Faculty',
  [ROLES.STUDENT]: 'Student',
};

export const ROLE_COLORS = {
  [ROLES.ADMIN]: 'bg-red-100 text-red-800',
  [ROLES.FACULTY]: 'bg-blue-100 text-blue-800',
  [ROLES.STUDENT]: 'bg-green-100 text-green-800',
};