<template>
    <div class="welcome-container">
      <header class="welcome-header">
        <div class="header-overlay">
          <h1>Bienvenido a TALLER INDUSTRIAL MECÁNICO</h1>
          <p class="header-subtitle">Precisión en cada soldadura • Excelencia en cada pieza</p>
        </div>
      </header>
  
      <main class="welcome-main">
        <section class="hero-section">
          <div class="hero-content">
            <h2>Fabricación de calidad con tecnología de vanguardia</h2>
            <p>Especialistas en mecanizado CNC, soldadura industrial y fabricación de piezas metálicas</p>
            <div class="cta-buttons">
              <router-link to="/login" class="btn btn-primary">Iniciar Secion</router-link>
            </div>
          </div>
          <div class="hero-image">
          </div>
        </section>
  
        <section class="features-section">
          <div class="feature-card" v-for="(feature, index) in features" :key="index">
            <div class="feature-icon">
              <i :class="feature.icon"></i>
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </section>
      </main>
  
      <footer class="welcome-footer">
        <p>© 2025 UNIVO - Centro de mecanizado y Soldadura • Hierro, precisión y calidad</p>
      </footer>
    </div>
  </template>
  
  <script setup>
  const features = [
    {
      icon: 'fas fa-cogs',
      title: 'Mecanizado CNC',
      description: 'Precisión milimétrica en todas nuestras piezas mecanizadas'
    },
    {
      icon: 'fas fa-fire',
      title: 'Soldadura Industrial',
      description: 'Técnicas avanzadas en soldadura MIG, TIG y por puntos'
    },
    {
      icon: 'fas fa-ruler-combined',
      title: 'Diseño y Fabricación',
      description: 'Desde prototipos hasta series medianas con garantía de calidad'
    }
  ]
  </script>
  
  <style scoped>
 
  
  
  </style>