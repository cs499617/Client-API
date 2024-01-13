<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { LOGIN_API, REGISTER_API } from '@/mixins/client-mixin';

/**
 * Login view page
 */

@Component({})
export default class LoginView extends Vue {
  screenName: string | null = null; // Initialize the screen name as an empty string

  loginFailed = ''; // Initialize a null string that will hold an error message

  // Initialize a null string that will hold an error message for registration
  nameErr = '';

  ageErr = '';

  // Create a new object for a user
  userData: {
    screeName: string,
    age: number,
    accessLevel: any
  }={
    screeName: '',
    age: 13,
    accessLevel: 'basic', // Always assign basic level
  }

  /**
   * Login function that helps the user login to the web page
   */
  async login() {
    try {
      // fetch a response from the login api url defined in mixin
      const response = await fetch(`${LOGIN_API}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          screenName: this.screenName, // send over the name
        }),
      });

      // if the name was found
      if (response.ok) {
        // no login error message is displayed
        this.loginFailed = '';

        // collect the response
        const data = await response.json();

        // define the attributes of a use from the collected response
        const {
          token, screenName, accessLevel, id,
        } = data;

        // Save the attributes in localStorage for API requests
        localStorage.setItem('token', token);

        localStorage.setItem('screenName', screenName);

        localStorage.setItem('accessLevel', accessLevel);

        localStorage.setItem('id', id);

        // Redirect to index page upon successful login
        this.$router.push('/index');
      } else {
        // Display an error about the login
        this.loginFailed = 'This screen name is not registered.';

        console.error('Login failed');
      }
    } catch (error) {
      // Handle any other errors that might occur during the fetch operation
      console.error('Fetch error:', error);
    }
  }

  /**
   * This function will help pop up the registration modal
   */
  showRegModal() {
    // Make the errors from previous try disappear
    this.nameErr = '';
    this.ageErr = '';
    // show modal
    this.$bvModal.show('regModal');
  }

  async submitReg(user: any) {
    try {
      // Make a new user instance
      const newUser = {
        screenName: user.screeName,
        age: parseInt(user.age, 10),
        accessLevel: 'basic',
      };
      // fetch a response from the registration api url defined in mixin
      const response = await fetch(`${REGISTER_API}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          newUser,
        ),
      });

      // If the user was created successfully
      if (response.ok) {
        // make the errors to be null
        this.nameErr = '';
        this.ageErr = '';

        // hide the modal since the user is now finished with this task
        this.$bvModal.hide('regModal');
        window.alert('Account successfully created!');
      } else {
        // There may be a problem with how the user registerd
        // Help the user to understand why
        // Get the error response
        const errorResponse = await response.json();

        // From the error response, find the errors
        const nameError = errorResponse.errors.find((error: {
          property: string;
        }) => error.property === 'screenName');

        const ageError = errorResponse.errors.find((error: {
          property: string;
        }) => error.property === 'age');

        // if an error occurred
        if (nameError && nameError.constraints) {
          // display the errors
          this.nameErr = nameError.constraints ? Object.values(nameError.constraints).join(', ')
            : 'Unknown error';
        }

        if (ageError && ageError.constraints) {
          // display the errors
          this.ageErr = ageError.constraints ? Object.values(ageError.constraints).join(', ')
            : 'Unknown error';
        }
      }
    } catch (error) {
      console.error('Error creating user catch :', error);
    }
  }
}

</script>

<template>
  <div class="text-center mt-5">
    <!-- Login form -->
    <b-form @submit.prevent="login">
      <b-form-group label="Screen name:" label-for="screenName" label-class="h3">
        <b-form-input
          v-model="screenName"
          type="text"
          id="screenName"
          name="screenName"
          required
          class="w-50 mx-auto"
          :class="{'is-invalid': loginFailed !== ''}"
        ></b-form-input>
        <b-form-invalid-feedback id="screenName-error" :state="loginFailed !== ''">
          {{ loginFailed }}
        </b-form-invalid-feedback>
      </b-form-group>
      <b-button type="submit" variant="warning">Login</b-button>
    </b-form>
    <div class="mt-5 text-info">
      <p> Don't have an account? Join the race
        <i class="fa-solid fa-flag-checkered fa-shake fa-lg"></i></p>
      <b-button type="button" variant="info" @click="showRegModal">Register</b-button>
    </div>
    <!-- registration modal -->
    <b-modal id="regModal" :title="'Edit Runway'" hide-footer>
      <b-form @submit.prevent="submitReg(userData)">
        <!-- screen name input -->
        <b-form-group
          label="Screen Name"
          label-for="ScreenName"
          description="Enter a screen name"
        >
          <b-input
            id="ScreenName"
            v-model="userData.screeName"
            type="text"
            :maxlength="50"
            :minlength="1"
            name="ScreenName:"
            :class="{'is-invalid': nameErr}"
            required
          ></b-input>
          <div v-if="nameErr" class="text-danger">{{ nameErr }}</div>
        </b-form-group>
        <!-- Age input -->
        <b-form-group
          label="Age:"
          label-for="age"
          description="Enter your age"
        >
          <b-input
            id="age"
            v-model="userData.age"
            type="number"
            :max="150"
            :min="13"
            name="age"
            :class="{'is-invalid': ageErr}"
            required
          ></b-input>
          <div v-if="ageErr" class="text-danger">{{ ageErr }}</div>
        </b-form-group>
        <div class="modal-footer d-flex justify-content-end">
          <b-button
            class="mt-3"
            variant="outline-primary"
            type="button"
            @click="$bvModal.hide('regModal')"
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
  </div>
</template>

<style scoped>

</style>
