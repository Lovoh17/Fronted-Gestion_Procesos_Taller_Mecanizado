<template>
  <div class="loading-container" :class="containerClass">
    <div class="spinner" :class="spinnerClass" :style="spinnerStyle">
      <div class="bounce1"></div>
      <div class="bounce2"></div>
      <div class="bounce3"></div>
    </div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script src="./scripts/LoadingSpinner.js"></script>
<style src="src/assets/Componentes_Style/LoadingSpinner.css" ></style>