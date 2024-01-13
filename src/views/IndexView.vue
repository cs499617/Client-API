<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Index from '@/components/Index.vue';

/**
 * Index view, the parent
 */
@Component({
  components: { Index },
})
export default class IndexView extends Vue {
  // Buttons array for the index page that will lead to other pages
  private buttons: { icon: string, color: string, title: string }[] = [
    // Queen button
    {
      icon: '<i class="fa-solid fa-crown fa-2xl"></i>',
      color: 'btn-outline-warning',
      title: 'Queen',
    },

    // Runway button
    {
      icon: '<i class="fa-solid fa-person-walking fa-2xl"></i>',
      color: 'btn-outline-success',
      title: 'Runway',
    },

    // Profile button
    {
      icon: '<i class="fa-regular fa-user fa-2xl"></i>',
      color: 'btn-outline-info',
      title: 'Profile',
    },
  ];

  // Handle the emitted event and redirect to a different URL
  private onButtonClick(button: { icon: string, color: string, title: string }) {
    // Construct the URL based on the title of the clicked button
    const dynamicURL = `http://localhost:8080/#/${button.title.toLowerCase()}`;

    // Redirect to the dynamically constructed URL
    window.location.href = dynamicURL;
  }
}
</script>

<template>
  <div>
    <Index msg="Welcome, begin exploring" :buttons="buttons" @button-clicked="onButtonClick" />
    <Index desc="As a regular user you may view and vote for your favourites queens and runways!
     As an admin user you may modify the information about queens and runways. "/>
  </div>
</template>

<style scoped>

</style>
