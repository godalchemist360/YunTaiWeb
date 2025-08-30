export async function fetchStats() {
  const response = await fetch('/api/users/stats');
  return response.json();
}

export async function fetchUsers({
  q,
  status,
  role,
  page,
  pageSize
}: {
  q?: string;
  status?: string;
  role?: string;
  page?: number;
  pageSize?: number;
}) {
  const params = new URLSearchParams();
  if (q) params.append('q', q);
  if (status) params.append('status', status);
  if (role) params.append('role', role);
  if (page) params.append('page', page.toString());
  if (pageSize) params.append('pageSize', pageSize.toString());

  const response = await fetch(`/api/users?${params}`);
  return response.json();
}

export async function createUser({
  account,
  display_name,
  role,
  status,
  password
}: {
  account: string;
  display_name: string;
  role: string;
  status?: string;
  password: string;
}) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ account, display_name, role, status, password }),
  });
  return response.json();
}

export async function updateUser(
  id: number,
  data: Partial<{ display_name: string; role: string; status: string; password: string }>
) {
  const response = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteUser(id: number) {
  const response = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}
