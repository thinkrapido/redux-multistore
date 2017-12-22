<template>
  <div class="hello">
    {{ state }}
    <button @click.stop.prevent="inc">Inc</button>
    <button @click.stop.prevent="dec">Dec</button>
  </div>
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
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
