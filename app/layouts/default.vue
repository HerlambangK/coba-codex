<template>
  <div>
    <UiNavbar sticky>
      <UiContainer class="flex h-14 items-center justify-between">
        <NuxtLink class="text-lg font-semibold" to="/">{{ SITE_NAME }}</NuxtLink>
        <div class="flex items-center gap-2">
          <UiButton
            external
            to="https://github.com/BayBreezy/nuxt-ui-thing-starter"
            target="_blank"
            variant="ghost"
            size="icon-sm"
            title="View on github"
          >
            <span class="sr-only">View on github</span>
            <Icon name="lucide:github" class="size-4" />
          </UiButton>
          <UiDropdownMenu>
            <UiDropdownMenuTrigger as-child>
              <UiButton class="h-9 w-9" variant="ghost" size="icon" title="Theme switcher">
                <span class="sr-only">Theme switcher</span>
                <ClientOnly>
                  <Icon :name="currentIcon || 'lucide:sun'" class="h-[18px] w-[18px]" />
                </ClientOnly>
              </UiButton>
            </UiDropdownMenuTrigger>
            <UiDropdownMenuContent align="end" :side-offset="5">
              <UiDropdownMenuItem
                class="cursor-pointer"
                v-for="(m, i) in modes"
                :key="i"
                :icon="m.icon"
                :title="m.title"
                @click="setTheme(m.value)"
              />
            </UiDropdownMenuContent>
          </UiDropdownMenu>

          <ClientOnly>
            <template v-if="me">
              <span class="text-sm opacity-80">{{ me.email }}</span>
              <UiButton variant="ghost" size="sm" @click="logout">Logout</UiButton>
            </template>
            <template v-else>
              <NuxtLink class="text-sm underline" to="/login">Login</NuxtLink>
              <NuxtLink class="text-sm underline" to="/register">Register</NuxtLink>
            </template>
          </ClientOnly>
        </div>
      </UiContainer>
    </UiNavbar>
    <slot />
  </div>
</template>

<script lang="ts" setup>
  import { useAuth } from '#imports'
  const modes = [
    { icon: "lucide:sun", title: "Light", value: "light" },
    { icon: "lucide:moon", title: "Dark", value: "dark" },
    { icon: "lucide:laptop", title: "System", value: "system" },
  ];

  const colorMode = useColorMode();
  const setTheme = (val: string) => {
    colorMode.preference = val;
  };

  const currentIcon = computed(() => {
    return modes.find((m) => m.value === colorMode?.preference)?.icon;
  });

  const { me, fetchMe, logout } = useAuth()
  onMounted(() => {
    fetchMe().catch(() => {})
  })
</script>
