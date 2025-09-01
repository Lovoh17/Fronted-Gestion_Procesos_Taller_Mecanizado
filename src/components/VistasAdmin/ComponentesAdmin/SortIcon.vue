<template>
  <span class="sort-icon">
    <span v-if="direction === 'asc'">↑</span>
    <span v-else-if="direction === 'desc'">↓</span>
  </span>
</template>

<script>
export default {
  name: 'SortIcon',
  props: {
    direction: {
      type: String,
      validator: (value) => ['asc', 'desc', null].includes(value),
      default: null
    }
  }
}
</script>

<style >
.sort-icon {
  margin-left: 5px;
  display: inline-block;
  width: 10px;
}
</style>