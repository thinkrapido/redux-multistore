<template>
  <h2 class="hello">
    {{ model }} is odd: {{ cfg.isOdd }}
    <button @click.stop.prevent="inc">Inc</button>
    <button @click.stop.prevent="dec">Dec</button>
  </h2>
</template>

<script>

export default {
  name: 'HelloWorld',
  store: 'CounterStore',
  methods: {
    inc: function (event) {
      this.$store.dispatch('inc')
    },
    dec: function (event) {
      this.$store.dispatch('dec')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h2 {
  font-weight: normal;
}
button {
  font-size: 1em;
}
</style>
