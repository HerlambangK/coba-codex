<template>
  <AppContainer>
    <div class="prose dark:prose-invert">
      <h1>Admin</h1>
    </div>
    <div class="mt-6 overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="text-left border-b">
            <th class="py-2 pr-4">Email</th>
            <th class="py-2 pr-4">Name</th>
            <th class="py-2 pr-4">Verified</th>
            <th class="py-2 pr-4">Role</th>
            <th class="py-2 pr-4"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id" class="border-b">
            <td class="py-2 pr-4">{{ u.email }}</td>
            <td class="py-2 pr-4">{{ u.name }}</td>
            <td class="py-2 pr-4">{{ u.isVerified ? 'Yes' : 'No' }}</td>
            <td class="py-2 pr-4">
              <select v-model="u.role" class="border rounded px-2 py-1">
                <option value="ADMIN">ADMIN</option>
                <option value="CUSTOMER">CUSTOMER</option>
              </select>
            </td>
            <td class="py-2 pr-4">
              <button class="px-3 py-1 border rounded" @click="updateRole(u)">Save</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </AppContainer>
</template>

<script setup lang="ts">
type UserRow = { id: string; email: string; name: string | null; isVerified: boolean; role: 'ADMIN' | 'CUSTOMER' }
const users = ref<UserRow[]>([])

onMounted(load)

async function load() {
  const res = await $fetch<{ users: UserRow[] }>('/api/admin/users')
  users.value = res.users
}

async function updateRole(u: UserRow) {
  await $fetch('/api/admin/users/role', { method: 'PATCH', body: { userId: u.id, role: u.role } })
}
</script>

