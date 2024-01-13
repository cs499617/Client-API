<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({})
export default class Index extends Vue {
  // Props
  @Prop() private msg!: string;

  @Prop() private desc!: string;

  @Prop() private buttons!: { icon: string, color: string, title: string }[];

  // Emit a custom event when a button is clicked
  private handleButtonClick(button: { icon: string, color: string, title: string }) {
    this.$emit('button-clicked', button);
  }
}

</script>

<template>
  <div>
    <h1>{{ msg }}</h1>
    <div class="btn-group">
      <div v-for="(button, index) in buttons" :key="index" class="button-container">
        <b-button @click="handleButtonClick(button)" type="button"
                  :class="['btn btn-lg', button.color, 'mr-5']" v-html="button.icon"></b-button>
        <div class="button-title text-center mr-5">{{ button.title }}</div>
      </div>
      <h3>{{ desc }}</h3>
    </div>
  </div>
</template>

<style scoped>

</style>
