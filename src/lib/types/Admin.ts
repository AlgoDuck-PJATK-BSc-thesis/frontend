export type PageData<T> = {
	items: T[];
	currPage: number;
	pageSize: number;
	totalItems: number;
	prevCursor: number | null;
	nextCursor: number | null;
};

export type UserRow = {
	userId: string;
	email: string;
	username: string;
	roles: string[];
};

export type SearchUsersResult = {
	idMatch: UserRow | null;
	username: PageData<UserRow>;
	email: PageData<UserRow>;
};

export type Tab = 'all' | 'search' | 'create' | 'update' | 'delete';
export type RoleFilter = 'all' | 'users' | 'admins';
export type CreateRole = 'user' | 'admin';
export type UpdateRole = 'keep' | 'user' | 'admin';

export type CreateUserResult = {
	userId: string;
	email: string;
	username: string;
	role: string;
	emailVerified: boolean;
};

export type UpdateUserResult = {
	userId: string;
	email: string;
	username: string;
	roles: string[];
};

export type SelectionSnapshotV1 = {
	version: 1;
	roleFilter: RoleFilter;
	selectedUsers: UserRow[];
	selectedExpanded: Record<string, boolean>;
	selectedOpen: boolean;
	activeUserId: string | null;
};
