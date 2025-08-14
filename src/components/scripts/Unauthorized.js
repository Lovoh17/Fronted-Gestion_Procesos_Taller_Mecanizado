import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

export default {
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const showLogout = computed(() => !!authStore.user)
    
    const goBack = () => {
      console.log('Going back from unauthorized page')
      if (window.history.length > 1) {
        router.go(-1)
      } else {
        router.push('/')
      }
    }
    
    const logout = () => {
      console.log('Logging out from unauthorized page')
      authStore.logout()
      router.push('/login')
    }
    
    return {
      showLogout,
      goBack,
      logout
    }
  }
}
