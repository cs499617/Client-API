<template>
  <div id="app">
    <img src="../images/logo.png" alt="logo" style="max-width: 150px; max-height: 150px;">
    <b-nav pills align="center" class="mb-4">
      <b-nav-item to="/index" exact-active-class="active" >Home</b-nav-item> |
      <b-nav-item to="/queen" exact-active-class="active"> Queens </b-nav-item> |
      <!--  Add Nav item for Student View -->
      <b-nav-item to="/runway" exact-active-class="active"> Runways </b-nav-item> |
      <!--  Add Nav item for Student View -->
      <b-nav-item to="/Profile" exact-active-class="active"> Profile </b-nav-item>
    </b-nav>
    <router-view class="container-xl"/>
  </div>
</template>
<script setup lang="ts">
</script>
