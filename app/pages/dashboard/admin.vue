<template>
  <AppContainer>
    <div class="prose dark:prose-invert">
      <h1>Admin</h1>
    </div>

    <!-- Global Search -->
    <div class="mt-6 md:w-1/2 lg:max-w-[360px]">
      <UiVeeInput v-model="search" placeholder="Cari email/nama…" icon="lucide:search" label="Users" />
    </div>

    <!-- Data Table -->
    <UiTable class="mt-6 overflow-x-auto">
      <UiTableHeader>
        <UiTableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id" class="bg-muted/50">
          <UiTableHead v-for="header in headerGroup.headers" :key="header.id" :colspan="header.colSpan"
            :class="header.column.getCanSort() ? 'cursor-pointer select-none' : ''"
            class="relative h-10 select-none border-t" @click="header.column.getToggleSortingHandler()?.($event)">
            <div class="flex w-full items-center gap-3 whitespace-nowrap">
              <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
                :props="header.getContext()" />
              <Icon v-if="header.column.getIsSorted() == 'asc'" name="lucide:chevron-up"
                class="size-4 shrink-0 text-muted-foreground" />
              <Icon v-else-if="header.column.getIsSorted() == 'desc'" name="lucide:chevron-down"
                class="size-4 shrink-0 text-muted-foreground" />
              <Icon v-else-if="header.column.getCanSort()" name="lucide:chevrons-up-down"
                class="size-4 shrink-0 text-muted-foreground/30" />

              <!-- Select filter dropdown for columns with meta.filterVariant = 'select' -->
              <div v-if="
                header.column.getCanFilter() &&
                header.column.columnDef?.meta?.filterVariant === 'select'
              ">
                <UiDropdownMenu>
                  <UiDropdownMenuTrigger as-child>
                    <UiButton variant="ghost" class="size-7" size="xs">
                      <Icon name="lucide:list-filter" class="size-4" />
                    </UiButton>
                  </UiDropdownMenuTrigger>
                  <UiDropdownMenuContent class="w-48">
                    <UiDropdownMenuRadioGroup :model-value="(header.column.getFilterValue() as string) ?? 'All'"
                      @update:model-value="
                        (e) => header.column.setFilterValue(e === 'All' ? undefined : e)
                      ">
                      <UiDropdownMenuRadioItem v-for="item in header.column.id === 'isVerified'
                        ? ['All', 'Yes', 'No']
                        : ['All', 'ADMIN', 'CUSTOMER']" :key="item" :value="item" :title="item" :text-value="item"
                        @select="(e) => e.preventDefault()" />
                    </UiDropdownMenuRadioGroup>
                  </UiDropdownMenuContent>
                </UiDropdownMenu>
              </div>
            </div>
          </UiTableHead>
        </UiTableRow>
      </UiTableHeader>

      <UiTableBody>
        <template v-if="table.getRowModel().rows?.length">
          <UiTableRow v-for="row in table.getRowModel().rows" :key="row.id"
            :data-state="row.getIsSelected() && 'selected'">
            <UiTableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </UiTableCell>
          </UiTableRow>
        </template>

        <template v-else>
          <UiTableRow>
            <UiTableCell :colspan="columns.length" class="h-24 text-center">
              No results.
            </UiTableCell>
          </UiTableRow>
        </template>
      </UiTableBody>
    </UiTable>

    <p class="mt-4 text-center text-sm text-muted-foreground">
      Data table with filters powered by
      <a class="underline hover:text-foreground" href="https://tanstack.com/table" target="_blank"
        rel="noopener noreferrer">
        TanStack Table
      </a>
    </p>
  </AppContainer>
</template>

<script setup lang="ts">
import {
  createColumnHelper,
  FlexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnFiltersState,
  type RowData,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/vue-table"
import { Icon, UiCheckbox } from "#components"

declare module "@tanstack/vue-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "select"
  }
}

type UserRow = {
  id: string
  email: string
  name: string | null
  isVerified: boolean
  role: "ADMIN" | "CUSTOMER"
}

const users = ref<UserRow[]>([])
const loadingInitial = ref(false)

// fetch data
onMounted(load)
async function load() {
  loadingInitial.value = true
  try {
    const res = await $fetch<{ users: UserRow[] }>("/api/admin/users")
    users.value = res.users
  } finally {
    loadingInitial.value = false
  }
}

async function updateRole(u: UserRow) {
  await $fetch("/api/admin/users/role", {
    method: "PATCH",
    body: { userId: u.id, role: u.role },
  })
}

// ---------------- TanStack Table Pattern ----------------
const columnHelper = createColumnHelper<UserRow>()

const columns = [
  // Selection checkbox column
  columnHelper.display({
    id: "select",
    enableSorting: false,
    enableGlobalFilter: false,
    header({ table }) {
      return h(UiCheckbox, {
        checked: table.getIsSomeRowsSelected()
          ? "indeterminate"
          : table.getIsAllRowsSelected()
            ? true
            : false,
        "onUpdate:checked": (v: boolean) =>
          table.getToggleAllRowsSelectedHandler()({ target: { checked: v } }),
      })
    },
    cell({ row }) {
      return h(UiCheckbox, {
        checked: row.getIsSelected(),
        disabled: !row.getCanSelect(),
        "onUpdate:checked": row.getToggleSelectedHandler(),
      })
    },
  }),

  // Email
  columnHelper.accessor("email", {
    header: "Email",
    sortingFn: "text",
    cell: ({ getValue }) => h("span", { class: "font-medium" }, getValue()),
  }),

  // Name
  columnHelper.accessor("name", {
    header: "Name",
    sortingFn: "text",
    cell: ({ getValue }) => getValue() || "-",
  }),

  // Verified (Yes/No) with select filter
  columnHelper.accessor("isVerified", {
    id: "isVerified",
    header: "Verified",
    meta: { filterVariant: "select" },
    enableSorting: true,
    filterFn: (row, columnId, filterValue: string | undefined) => {
      if (!filterValue) return true
      const v = row.getValue<boolean>(columnId)
      return filterValue === "Yes" ? v === true : filterValue === "No" ? v === false : true
    },
    cell: ({ getValue }) => {
      const v = getValue<boolean>()
      return h(
        "span",
        {
          class:
            "inline-flex items-center gap-2 rounded px-2 py-0.5 text-xs font-medium " +
            (v ? "bg-emerald-400/20 text-emerald-600" : "bg-rose-400/20 text-rose-600"),
        },
        [
          h(Icon, {
            name: v ? "lucide:check-circle" : "lucide:x-circle",
            class: "size-3.5",
            ariaHidden: true,
          }),
          v ? "Yes" : "No",
        ],
      )
    },
  }),

  // Role (editable select) with select filter
  columnHelper.accessor("role", {
    id: "role",
    header: "Role",
    meta: { filterVariant: "select" },
    enableSorting: true,
    filterFn: (row, columnId, filterValue: string | undefined) => {
      if (!filterValue) return true
      return row.getValue<string>(columnId) === filterValue
    },
    cell: ({ row }) =>
      h(
        "select",
        {
          class:
            "border rounded px-2 py-1 bg-background text-foreground outline-none focus:ring",
          value: row.original.role,
          onChange: (e: Event) => {
            const val = (e.target as HTMLSelectElement).value as UserRow["role"]
            row.original.role = val
          },
        },
        [
          h("option", { value: "ADMIN" }, "ADMIN"),
          h("option", { value: "CUSTOMER" }, "CUSTOMER"),
        ],
      ),
  }),

  // Actions
  columnHelper.display({
    id: "actions",
    enableSorting: false,
    enableGlobalFilter: false,
    header: "",
    cell: ({ row }) =>
      h(
        "button",
        {
          class:
            "inline-flex items-center gap-2 rounded border px-3 py-1 text-sm hover:bg-muted",
          onClick: () => updateRole(row.original),
        },
        [
          h(Icon, { name: "lucide:save", class: "size-4", ariaHidden: true }),
          "Save",
        ],
      ),
  }),
]

// States seperti pattern
const rowSelection = ref<RowSelectionState>({})
const columnFilters = ref<ColumnFiltersState>([])
const sorting = ref<SortingState>([])
const search = ref("")
const globalFilter = refDebounced(search, 300)

// Table instance
const table = useVueTable({
  columns,
  // data reactive
  data: computed(() => users.value),
  enableRowSelection: true,
  getCoreRowModel: getCoreRowModel<UserRow>(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),
  state: {
    get rowSelection() {
      return rowSelection.value
    },
    get sorting() {
      return sorting.value
    },
    get globalFilter() {
      return globalFilter.value
    },
    get columnFilters() {
      return columnFilters.value
    },
  },
  // Global filter: cari di email & name
  globalFilterFn: (row, _columnId, filterValue: string) => {
    if (!filterValue) return true
    const q = filterValue.toLowerCase()
    const email = String(row.original.email ?? "").toLowerCase()
    const name = String(row.original.name ?? "").toLowerCase()
    return email.includes(q) || name.includes(q)
  },
  onRowSelectionChange: (next) => {
    rowSelection.value = typeof next === "function" ? next(rowSelection.value) : next
  },
  onSortingChange: (next) => {
    sorting.value = typeof next === "function" ? next(sorting.value) : next
  },
  onGlobalFilterChange: (next) => {
    search.value = typeof next === "function" ? next(globalFilter.value) : next
  },
  onColumnFiltersChange: (next) => {
    columnFilters.value = typeof next === "function" ? next(columnFilters.value) : next
  },
})
</script>
