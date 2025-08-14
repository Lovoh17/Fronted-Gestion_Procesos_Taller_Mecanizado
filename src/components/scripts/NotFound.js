import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    const currentPath = ref('')
    const isAuthenticated = ref(false)
    
    // Simulación de verificación de autenticación sin depender del store
    onMounted(() => {
      currentPath.value = route.path
      // Verificación simple de autenticación (puedes personalizar esto)
      isAuthenticated.value = localStorage.getItem('authToken') !== null
      
      console.log('NotFound component mounted, path:', currentPath.value)
      console.log('User authenticated:', isAuthenticated.value)
    })
    
    const goBack = () => {
      if (window.history.length > 1) {
        console.log('Going back in history')
        router.go(-1)
      } else {
        console.log('No history, redirecting to home')
        router.push('/')
      }
    }
    
    return {
      currentPath,
      isAuthenticated,
      goBack
    }
  }
}
