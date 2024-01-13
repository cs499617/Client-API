<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { PROFILE_API, REGISTER_API } from '@/mixins/client-mixin';

/**
 * Profile view page
 */

@Component({})
export default class ProfileView extends Vue {
  screenName: string | null = localStorage.getItem('screenName'); // Get the users screen name
  // from local storage

  accessLevel: string | null = localStorage.getItem('accessLevel'); // Get the users access
  // level from local storage

  token: string | null = localStorage.getItem('token'); // Get the users token from local
  // storage

  id: string | null = localStorage.getItem('id'); // Get the users id from local storage

  nameErr: any= ''; // Initialize an error message

  /**
   * This function saves an edit made on the edit form
   */
  async saveEdit() {
    try {
      // Fetch a response from the url defined in the mixin
      const response = await fetch(`${PROFILE_API}/${this.id}`, {
        method: 'PUT', // do put/ update method
        headers: {
          // Send headers to api
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          screenName: this.screenName// send the new screen name
        }),
      });

      // If the edit was a success
      if (response.ok) {
        // Set the new screenName in local storage
        if (this.screenName != null) {
          localStorage.setItem('screenName', this.screenName);
        }
        console.log('Saved successfully');
        // hide the modal
        this.$bvModal.hide('editScreenName');

        // Display no errors
        this.nameErr = '';
      } else {
        // Collect the error
        const errorResponse = await response.json();

        console.log(errorResponse);

        // Find the error related to the screen name
        const nameError = errorResponse.errors.find((error: { property: string }) => error.property === 'screenName');

        // if the screen name error exists
        if (nameError && nameError.constraints) {
          // assign it to the variable that will display the error
          this.nameErr = nameError.constraints ? Object.values(nameError.constraints).join(', ')
            : 'Unknown error';
        }

        console.log('there was an error', response.statusText);
      }
    } catch (error) {
      // Handle any other errors that might occur during the fetch operation
      console.log('Fetch error:', error);
    }
  }

  /**
   *  This function helps to pop up the modal that allows for editing
   */
  async showEditScreenName() {
    // If there was errors displayed last time the user opened this modal, erase them
    this.nameErr = '';
    // show the modal
    this.$bvModal.show('editScreenName');
  }

  /**
   * This function helps the user log out the web page
   */
  logout() {
    // Clear user-related information from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('screenName');
    localStorage.removeItem('accessLevel');

    // Redirect to the login page
    this.$router.push('/login');
  }

  /**
   * This function deletes the user account
   */
  async deleteAccount() {
    try {
      // Fetch a response from the API endpoint for deleting the account
      const response = await fetch(`${REGISTER_API}/${this.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (response.ok) {
        // Clear user-related information from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('screenName');
        localStorage.removeItem('accessLevel');

        // Redirect to the login page
        this.$router.push('/login');
      } else {
        // Handle the error or show a message to the user
        console.error('Error deleting account:', response.statusText);
      }
    } catch (error) {
      // Handle any other errors that might occur during the fetch operation
      console.error('Fetch error:', error);
    }
  }

  /**
   * This method will help to close the edit modal and not save the changes made
   * to the users screen name
   */
  cancelEdit()
  {
    // hide the modal
    this.$bvModal.hide('editScreenName');
    //rest the name back to the original name
    this.screenName=localStorage.getItem('screenName');
  }
}
</script>

<template>
  <div>
    <!-- modal for editing screen name -->
    <b-modal :id="'editScreenName'" :title="'Edit Your Screen name'" hide-footer>
      <b-form @submit.prevent="saveEdit">
        <b-form-group
          label="Screen Name:"
          label-for="'editName'"
          description="Enter your screen name"
        >
          <b-input
            id="'editName'"
            v-model="screenName"
            type="text"
            :name="'editName'"
            :class="{'is-invalid': nameErr}"
            :maxlength="50"
            :minlength="1"
            required
          ></b-input>
          <div v-if="nameErr" class="text-danger">{{ nameErr }}</div>
        </b-form-group>

        <div class="modal-footer d-flex justify-content-end">
          <!-- Cancel and Save buttons -->
          <b-button
            class="mt-3"
            variant="outline-primary"
            @click="cancelEdit"
          >
            Cancel
          </b-button>
          <b-button
            class="mt-3"
            variant="outline-success"
            type="submit"
          >
            Save
          </b-button>
        </div>
      </b-form>
    </b-modal>
    <!-- Users information page -->
    <div>
      <h1 class="text-info mb-5">Welcome back, {{screenName}}</h1>
    </div>
    <h2>Screen name: <span class="text-info">{{screenName}}   </span>
      <button @click="showEditScreenName" class="btn btn-link btn-lg btn-outline-primary">
        <i class="fa-solid fa-pencil fa-bounce fa-2xl" style="color: #ffa200;"></i>
      </button></h2>
    <h2>Access level: <span class="text-info">{{accessLevel}}</span></h2>
    <small v-if="accessLevel=='admin'">With great power comes great responsibility.</small>
    <div class="mt-5">
      <div class="row">
        <div class="col">
          <!-- Logout button attached to the function logout -->
          <button @click="logout" class="btn btn-info">Logout</button>
        </div>
        <div class="col">
          <!-- Delete Account button -->
          <button @click="$bvModal.show('deleteAcc')" class="btn btn-danger ml-2">Delete Account</button>
        </div>
      </div>
    </div>
    <!-- Delete Confirmation Modal -->
    <b-modal id="deleteAcc" :title="'Confirm Deletion'" hide-footer>
      <p>Are you sure you want to delete your account?</p>
      <div class="modal-footer d-flex justify-content-end">
        <b-button variant="outline-secondary" @click="$bvModal.hide('deleteAcc')">Cancel
        </b-button>
        <b-button variant="outline-danger" @click="deleteAccount">Delete</b-button>
      </div>
    </b-modal>
  </div>
</template>

<style scoped>

</style>
