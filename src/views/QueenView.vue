<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import GlobalMixin, { ACCESS_LEVEL, QUEEN_API } from '@/mixins/client-mixin';

/**
 * Queen view page
 */
@Component({
  mixins: [GlobalMixin], // Mixin
})
export default class QueenView extends Vue {
  queens: any[] = []; // Array of queens

  openQueens: any[] = []; // Keep track of what queens cards are opened

  accessLevel: string | null = localStorage.getItem('accessLevel'); // Get the users
  // access level from local storage

  token: string | null = localStorage.getItem('token'); // Get the users token
  // from local storage

  // Initialize error holders for the queens attributes ( will be used for adding/editing forms)
  nameErr: any= '';

  stateErr : any= '';

  cityErr: any= '';

  birthErr: any= '';

  imageErr: any= '';

  isGridLayout= true; // Track the current layout of the web page

  // List of all states in America, useful for the select box in form
  states: string[] = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma',
    'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee',
    'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
  ];

  selectedQueenIndex: any=null; // Keep track of the queens index in the array

  selectedQueen: any='h'; // Keep track of the queen selected

  // Queen object to help create a new instance of a queen
  queenData: {
    queenName: string;
    city: string;
    state: string;
    birthYear: number;
    imagePath: string;
  } = {
    queenName: '',
    city: '',
    state: '',
    birthYear: 2000, // By default a queen will be born in the year 2000
    imagePath: 'images/queen-name/icon.png', // By default this is the queens icon path
  };

  mounted() {
    this.fetchQueens();
  }

  /**
   * This function will help to collect all the queen from the api
   */
  async fetchQueens() {
    try {
      // fetch a response from the url defined in the mixin
      const response = await fetch(`${QUEEN_API}`);
      // hold the queens object
      const queens = await response.json();
      // copy the queens to our queens object defined globally
      this.queens = queens.map((queen: any) => ({ ...queen, id: queen.id || null }));
    } catch (error) {
      console.error('Error fetching queens:', error);
    }
  }

  /**
   * This function helps to toggle the information on a queens card
   * @param queen
   */
  toggleQueen(queen: any) {
    // Get the index of the queen
    const index = this.openQueens.indexOf(queen);

    if (index !== -1) {
      // Queen is already open, so close it
      this.openQueens.splice(index, 1);
    } else {
      // Queen is not open, so open it
      this.openQueens.push(queen);
    }
  }

  /**
   *  This function will save an edit made to a queen
   * @param index
   * @param queen
   */
  async saveEdit(index: any, queen: any) {
    try {
      // Make all the error holders null
      this.nameErr = null;

      this.birthErr = null;

      this.stateErr = null;

      this.cityErr = null;

      // make a new instance of queen
      const newQueen = {
        queenName: queen.queenName,
        city: queen.city,
        state: queen.state,
        birthYear: parseInt(queen.birthYear, 10),
        imagePath: queen.imagePath,
      };

      // Fetch a response from the url defined in the mixin
      const response = await fetch(`${QUEEN_API}/${queen.id}`, {
        method: 'PUT', // put or update is our method
        headers: {
          // send over the cors headers the api accepts
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(newQueen),
      });

      // If we successfully edited a queen
      if (response.ok) {
        console.log('Update successful');
        // Hide the modal
        this.$bvModal.hide(`editQueenModal${index}`);
        // Fetch the queens again as a "refresh" of the page in order to show the new edits
        this.fetchQueens();

        // Make the errors null
        this.nameErr = null;

        this.birthErr = null;

        this.stateErr = null;

        this.cityErr = null;

        this.imageErr = null;
      } else {
        // if it failed to update collect the errors
        const errorResponse = await response.json();

        // Find the error related  to each attribute the queen has
        const queenNameError = errorResponse.errors.find((error: { property: string; }) => error.property === 'queenName');

        const stateError = errorResponse.errors.find((error: { property: string; }) => error.property === 'state');

        const cityError = errorResponse.errors.find((error: { property: string; }) => error.property === 'city');

        const birthYearError = errorResponse.errors.find((error: { property: string; }) => error.property === 'birthYear');

        const imageError = errorResponse.errors.find((error: { property: string; }) => error.property === 'imagePath');

        // If an error exists for a certain attribute, display it to the user
        if (queenNameError && queenNameError.constraints) {
          this.nameErr = queenNameError.constraints.isLength;
        }

        if (stateError && stateError.constraints) {
          this.stateErr = stateError.constraints.isLength;
        }

        if (cityError && cityError.constraints) {
          this.cityErr = cityError.constraints.isLength;
        }

        if (birthYearError && birthYearError.constraints) {
          this.birthErr = birthYearError.constraints ?
            Object.values(birthYearError.constraints).join(', ')
            : 'Unknown error';
        }

        if (imageError && imageError.constraints) {
          this.imageErr = imageError.constraints.matches;
        }
      }
    } catch (error) {
      console.error('Error updating queen:', error);
    }
  }

  /**
   * This function returns if a queens card is open
   * @param queen
   */
  isQueenOpen(queen: any) {
    return this.openQueens.includes(queen);
  }

  /**
   * This function switches to grid view
   */
  switchToGrid() {
    this.isGridLayout = true;
  }

  /**
   * This function switches to list view
   */
  switchToList() {
    this.isGridLayout = false;
  }

  /**
   * This function helps to pop up an edit modal
   * @param index
   * @param queen
   */
  editQueenModal(index: any, queen:any) {
    // Display the errors as null, this is to avoid showing errors from a previous open
    this.nameErr = null;

    this.birthErr = null;

    this.stateErr = null;

    this.cityErr = null;

    this.imageErr = null;

    this.selectedQueenIndex = index;

    this.selectedQueen = { ...queen };
    // Show the modal with the right index
    this.$bvModal.show(`editQueenModal${index}`);
  }

  /**
   * This functions helps to pop up the delete modal
   * @param index
   */
  deleteQueenModal(index: any) {
    this.$bvModal.show(`deleteQueenModal${index}`);
  }

  /**
   * This function helps to delete a queen from the api's database
   * @param index
   * @param queen
   */
  async confirmDelete(index:any, queen:any) {
    try {
      // fetch a response from the url defined in the mixin
      const response = await fetch(`${QUEEN_API}/${queen.id}`, {
        method: 'DELETE', // the method is delete
        headers: {
          // send over the cors headers the api accepts
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(queen.id),
      });

      // If the delete was successful
      if (response.ok) {
        console.log('Add Queen successful');
        // Hide the modal
        this.$bvModal.hide('addQueenModal');

        this.fetchQueens(); // Refresh the list of queens after adding a new one
      } else {
        console.error('Error adding queen:', response.statusText);

        try {
          const errorResponse = await response.json();
          console.error('Error response:', errorResponse);
        } catch (jsonError) {
          console.error('Error parsing JSON response:', jsonError);
        }

        throw new Error('Add Queen failed');
      }
    } catch (error) {
      console.error('Error adding queen:', error);
    }
  }

  /**
   * This function helps to create a new queen and add the queen to the api's database
   * @param queen
   */
  async saveAdd(queen: any) {
    try {
      // Create a new instance of a queen based off the users form inputs
      const newQueen = {
        queenName: queen.queenName,
        city: queen.city,
        state: queen.state,
        birthYear: parseInt(queen.birthYear, 10),
        imagePath: queen.imagePath,
      };

      // Fetch a response from the url defined in the mixin
      const response = await fetch(`${QUEEN_API}`, {
        method: 'POST', // the method is post/ create
        headers: {
          // send over the header that the api accepts
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(newQueen),
      });

      // If the add was successful
      if (response.ok) {
        // Make the errors null
        this.nameErr = null;

        this.birthErr = null;

        this.stateErr = null;

        this.cityErr = null;

        this.imageErr = null;

        console.log('Add Queen successful');
        // Hide the modal
        this.$bvModal.hide('addQueenModal');

        this.fetchQueens(); // Refresh the list of queens after adding a new one
      } else {
        console.error('Error adding queen:', response.statusText);
        // Collect the errors
        const errorResponse = await response.json();

        // Find the error related to the attributes a queen has
        const queenNameError = errorResponse.errors.find((error: { property: string; }) => error.property === 'queenName');

        const stateError = errorResponse.errors.find((error: { property: string; }) => error.property === 'state');

        const cityError = errorResponse.errors.find((error: { property: string; }) => error.property === 'city');

        const birthYearError = errorResponse.errors.find((error: { property: string; }) => error.property === 'birthYear');

        const imageError = errorResponse.errors.find((error: { property: string; }) => error.property === 'imagePath');

        // If errors are found display them on the modal
        if (queenNameError && queenNameError.constraints) {
          this.nameErr = queenNameError.constraints.isLength;
        }

        if (stateError && stateError.constraints) {
          this.stateErr = stateError.constraints.isLength;
        }

        if (cityError && cityError.constraints) {
          this.cityErr = cityError.constraints.isLength;
        }

        if (birthYearError && birthYearError.constraints) {
          this.birthErr = birthYearError.constraints ?
            Object.values(birthYearError.constraints).join(', ')
            : 'Unknown error';
        }

        if (imageError && imageError.constraints) {
          this.imageErr = imageError.constraints.matches;
        }
      }
    } catch (error) {
      console.error('Error adding queen:', error);
    }
  }

  /**
   * This function helps to pop up the add modal
   */
  showAddModal() {
    // Make all the errors null to avoid listing errors from a previous try
    this.nameErr = null;

    this.birthErr = null;

    this.stateErr = null;

    this.cityErr = null;

    this.imageErr = null;
    // Show the modal
    this.$bvModal.show('addQueenModal');
  }
}

</script>

<template>
  <div class="container mt-5">
    <h1>Queens</h1>
    <div class="row">
      <div class="col-md-6 text-left">
        <!-- Add Queen Button, if user is not admin its disabled -->
        <button @click="showAddModal" :disabled="accessLevel != 'admin'" class="btn btn-link ">
          <i class="fa-solid fa-circle-plus"></i> Add Queen
        </button>
      </div>
      <div class="col-md-6 text-right">
        <!-- Toggle Button for Layout -->
        <button @click="switchToGrid" class="btn btn-link" :class="{'btn-active': isGridLayout}">
          <i class="fa-solid fa-grip-vertical"></i>
        </button>
        <button @click="switchToList" class="btn btn-link" :class="{'btn-active': !isGridLayout}">
          <i class="fa-solid fa-list-ul"></i>
        </button>
      </div>
    </div>
    <!-- Modal for adding a new Queen -->
    <b-modal id="addQueenModal" title="Add Queen" hide-footer>
      <!-- saveAdd() will help add the new Queen -->
      <b-form @submit.prevent="saveAdd(queenData)">
        <!-- name input-->
        <b-form-group
          label="Name:"
          label-for="addName"
          description="Enter the queen's name"
        >
          <b-input
            id="addName"
            v-model="queenData.queenName"
            type="text"
            :class="{'is-invalid': nameErr}"
            required
          ></b-input>
          <div v-if="nameErr" class="text-danger">{{ nameErr }}</div>
        </b-form-group>
        <!-- city input-->
        <b-form-group
          label="City:"
          label-for="addCity"
          description="Enter the queen's city"
        >
          <b-input
            id="addCity"
            v-model="queenData.city"
            type="text"
            :class="{'is-invalid': cityErr}"
            required
          ></b-input>
          <div v-if="cityErr" class="text-danger">{{ cityErr }}</div>
        </b-form-group>
        <!-- state input-->
        <b-form-group
          label="State:"
          label-for="addState"
          description="Select the queen's state"
        >
          <b-form-select
            id="addState"
            v-model="queenData.state"
            :class="{'is-invalid': stateErr}"
            required
          >
            <b-form-select-option
              value=""
              disabled
              selected
            >
              Select a state
            </b-form-select-option>
            <b-form-select-option
              v-for="state in states"
              :key="state"
              :value="state"
            >
              {{ state }}
            </b-form-select-option>
          </b-form-select>
          <div v-if="stateErr" class="text-danger">{{ stateErr }}</div>
        </b-form-group>
        <!-- birth year input-->
        <b-form-group
          label="Birth Year:"
          label-for="addBirthYear"
          description="Enter the queen's birth year"
        >
          <b-input
            id="addBirthYear"
            v-model="queenData.birthYear"
            type="number"
            :class="{'is-invalid': birthErr}"
            max="2005"
            min="1900"
          ></b-input>
          <div v-if="birthErr" class="text-danger">{{ birthErr }}</div>
        </b-form-group>
        <!-- image path input-->
        <b-form-group
          label="Image path:"
          label-for="addImage"
          description="Enter the image path"
        >
          <b-input
            id="addImage"
            v-model="queenData.imagePath"
            type="text"
            value="images/queen-name/icon.png"
            :class="{'is-invalid': imageErr}"
            required
          ></b-input>
          <div v-if="imageErr" class="text-danger">{{ imageErr }}</div>
        </b-form-group>
      </b-form>
      <!-- Cancel and Save buttons -->
      <div class="modal-footer d-flex justify-content-end">
        <b-button
          class="mt-3"
          variant="outline-primary"
          @click="$bvModal.hide('addQueenModal')"
        >
          Cancel
        </b-button>
        <b-button
          class="mt-3"
          variant="outline-success"
          :disabled="accessLevel !== 'admin'"
          @click="saveAdd(queenData)"
        >
          Save
        </b-button>
      </div>
    </b-modal>
    <!-- Edit modal -->
    <b-modal :id="'editQueenModal' + selectedQueenIndex" :title="'Edit ' + selectedQueen.queenName"
             hide-footer>
      <!-- submits to saveEdit()-->
      <b-form @submit.prevent="saveEdit(selectedQueenIndex, selectedQueen)">
        <!-- name input-->
        <b-form-group
          label="Name:"
          label-for="'editName' + selectedQueenIndex"
          description="Enter the queen's name"
        >
          <b-input
            v-model="selectedQueen.queenName"
            type="text"
            :id="'editName' + selectedQueenIndex"
            :name="'editName' + selectedQueenIndex"
            required
            :class="{'is-invalid': nameErr}"
          ></b-input>
          <div v-if="nameErr" class="text-danger">{{ nameErr }}</div>
        </b-form-group>
        <!-- city input-->
        <b-form-group
          label="City:"
          label-for="'editCity' + selectedQueenIndex"
          description="Enter the queen's city"
        >
          <b-input
            v-model="selectedQueen.city"
            type="text"
            :id="'editCity' + selectedQueenIndex"
            :name="'editCity' + selectedQueenIndex"
            required
            :class="{'is-invalid': cityErr}"
          ></b-input>
          <div v-if="cityErr" class="text-danger">{{ cityErr }}</div>
        </b-form-group>
        <!-- state input-->
        <b-form-group
          label="State:"
          label-for="'editState' + selectedQueenIndex"
          description="Select the queen's state"
        >
          <b-form-select
            v-model="selectedQueen.state"
            :id="'editState' + selectedQueenIndex"
            :name="'editState' + selectedQueenIndex"
            required
            :class="{'is-invalid': stateErr}"
          >
            <b-form-select-option
              value=""
              disabled
              selected
            >
              Select a state
            </b-form-select-option>
            <b-form-select-option
              v-for="state in states"
              :key="state"
              :value="state"
            >
              {{ state }}
            </b-form-select-option>
          </b-form-select>
          <div v-if="stateErr" class="text-danger">{{ stateErr }}</div>
        </b-form-group>
        <!-- birth year input-->
        <b-form-group
          label="Birth Year:"
          label-for="'editBirthYear' + selectedQueenIndex"
          description="Enter the queen's birth year"
        >
          <b-input
            v-model="selectedQueen.birthYear"
            type="number"
            :id="'editBirthYear' + selectedQueenIndex"
            :name="'editBirthYear' + selectedQueenIndex"
            max="2005"
            min="1900"
            required
            :class="{'is-invalid': birthErr}"
          ></b-input>
          <div v-if="birthErr" class="text-danger">{{ birthErr }}</div>
        </b-form-group>
        <!-- image path input-->
        <b-form-group
          label="Image path:"
          label-for="editImage"
          description="Enter the image path"
        >
          <b-input
            v-model="selectedQueen.imagePath"
            type="text"
            :id="'editImage' + selectedQueenIndex"
            name="editImage"
            value="images/queen-name/icon.png"
            required
            :class="{'is-invalid': imageErr}"
          ></b-input>
          <div v-if="imageErr" class="text-danger">{{ imageErr }}</div>
        </b-form-group>
      </b-form>
      <!-- Cancel and Save buttons-->
      <div class="modal-footer d-flex justify-content-end">
        <div class="d-flex">
          <b-button
            class="mt-3 mr-3"
            variant="outline-primary"
            @click="$bvModal.hide('editQueenModal' + selectedQueenIndex)"
          >
            Cancel
          </b-button>
          <b-button
            class="mt-3"
            variant="outline-success"
            :disabled="accessLevel !== 'admin'"
            @click="saveEdit(selectedQueenIndex, selectedQueen)"
          >
            Save
          </b-button>
        </div>
      </div>
    </b-modal>
    <!-- Grid View -->
    <div v-if="isGridLayout">
      <div class="row">
        <div v-for="(queen, index) in queens" :key="index" class="col-md-6 mb-3">
          <div v-if="index < queens.length " class="card border-light mb-4">
            <!-- Delete Queen Modal -->
            <b-modal :id="'deleteQueenModal'+index" :title="'Delete '+queen.queenName" hide-footer>
              <p>Are you sure you want to delete <span class="text-danger">
                {{queen.queenName}}</span> ?</p>
              <div class="modal-footer d-flex justify-content-end">
                <button @click="$bvModal.hide('deleteQueenModal'+index)"
                        class="btn btn-outline-success">Cancel</button>
                <button @click="confirmDelete(index, queen)" class="btn btn-outline-danger"
                        :disabled="accessLevel != 'admin'">Delete</button>
              </div>
            </b-modal>
            <!-- Cards for each queen -->
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <img :src="queen.imagePath" class="card-img-top" alt="Queen Image"
                       style="width: 250px; height: 330px;" />
                </div>
                <div class="col-md-6">
                  <h4 class="queen-name">
                    {{ queen.queenName }}
                    <button class="btn btn-link btn-lg btn-outline-primary toggle-button"
                            @click="toggleQueen(queen)">
                      <i :class="isQueenOpen(queen) ? 'fa-solid fa-caret-down fa-xl' :
                           'fa-solid fa-caret-up rotate-up fa-xl'"
                         :style="'color: #ff00d0;'">
                      </i>
                    </button>
                  </h4>
                  <!-- check if a queens card is open and display their cards accordingly-->
                  <div v-if="isQueenOpen(queen)" class="queen-details mt-3">
                    <h4 class="mt-4 py-2">
                      <strong class="text-info">City:</strong> {{ queen.city }}
                    </h4>
                    <h4 class="py-2">
                      <strong class="text-info">State:</strong> {{ queen.state }}
                    </h4>
                    <h4 class="py-2">
                      <strong class="text-info">Birth year:</strong> {{ queen.birthYear }}
                    </h4>
                    <div class="py-4"></div>
                    <div class="mt-5 pr-4 text-right">
                      <!-- buttons for editing and deleting a queen placed on their card
                      Buttons disabled unless user is admin
                      -->
                      <button @click="editQueenModal(index, queen)"
                              class="btn btn-link btn-lg btn-outline-primary"
                              :disabled="accessLevel != 'admin'">
                        <i class="fa-solid fa-pencil fa-bounce fa-2xl" style="color: #ffa200;"></i>
                      </button>
                      <button @click="deleteQueenModal(index)"
                              class="btn btn-link btn-lg btn-outline-danger"
                              :disabled="accessLevel != 'admin'">
                        <i class="fa-regular fa-trash-can fa-2xl"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else>
      <div v-for="(queen, index) in queens" :key="index" class="col-md-12 mb-3">
        <div v-if="index < queens.length " class="card border-light mb-4">
          <!-- Delete Queen Modal -->
          <b-modal :id="'deleteQueenModal'+index" :title="'Delete '+queen.queenName" hide-footer>
            <p>Are you sure you want to delete
              <span class="text-danger">{{queen.queenName}}</span> ?</p>
            <div class="modal-footer d-flex justify-content-end">
              <button @click="$bvModal.hide('deleteQueenModal'+index)"
                      class="btn btn-outline-success">Cancel</button>
              <button @click="confirmDelete" class="btn btn-outline-danger"
                      :disabled="accessLevel != 'admin'">Delete</button>
            </div>
          </b-modal>
          <!-- each queen is put into their own card -->
          <div class="card-body">
            <div class="row">
              <div class="col-md-4">
                <img :src="queen.imagePath" class="card-img-top" alt="Queen Image" />
              </div>
              <div class="col-md-8">
                <h2 class="queen-name">
                  {{ queen.queenName }}
                  <!-- Buttons to open a queens card -->
                  <button class="btn btn-link btn-lg btn-outline-primary toggle-button"
                          @click="toggleQueen(queen)">
                    <i :class="isQueenOpen(queen) ? 'fa-solid fa-caret-down fa-xl' :
                         'fa-solid fa-caret-up rotate-up fa-xl'"
                       :style="'color: #ff00d0;'">
                    </i>
                  </button>
                </h2>
                <!-- if a queens card is open display their info -->
                <div v-if="isQueenOpen(queen)" class="queen-details mt-3">
                  <h4 class="mt-4 py-2">
                    <strong class="text-info">City:</strong> {{ queen.city }}
                  </h4>
                  <h4 class="py-2">
                    <strong class="text-info">State:</strong> {{ queen.state }}
                  </h4>
                  <h4 class="py-2">
                    <strong class="text-info">Birth year:</strong> {{ queen.birthYear }}
                  </h4>
                  <div class="py-4"></div>
                  <div class="mt-5 pr-4 text-right">
                    <!-- Buttons only admins can use to edit ordelete a queen placed on their cards
                    -->
                    <button @click="editQueenModal(index, queen)"
                            class="btn btn-link btn-lg btn-outline-primary"
                            :disabled="accessLevel != 'admin'">
                      <i class="fa-solid fa-pencil fa-bounce fa-2xl" style="color: #ffa200;"></i>
                    </button>
                    <button @click="deleteQueenModal(index)"
                            class="btn btn-link btn-lg btn-outline-danger" :disabled="false">
                      <i class="fa-regular fa-trash-can fa-2xl"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>
    </div>
  </div>
</template>

<style scoped>

</style>
