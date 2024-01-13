<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { RUNWAY_API, QUEEN_API } from '@/mixins/client-mixin';

/**
 * Runway view page
 */
@Component({})
export default class RunwayView extends Vue {
  runways: any[] = []; // array of runways

  queens: any[] = []; // array of queens

  isGridLayout = true; // Track the current layout

  selectedRunwayIndex: any = null; // to help track an index of a runway

  selectedRunway: any= ''; // help to track a selected runway, put as '' to avoid null error

  accessLevel: string | null = localStorage.getItem('accessLevel'); // in local storage is the
  // users access level

  token: string | null = localStorage.getItem('token'); // in local storage is the users token

  episodeErr: any = ''; // helps to display an error associated with episodes

  seasonErr: any = ''; // helps to display an error associated with seasons

  yearErr: any = ''; // helps to display an error associated with years

  wonErr: any = ''; // helps to display an error associated with winnings

  imageErr: any = ''; // helps to display an error associated with images

  queenErr: any = ''; // helps to display an error associated with queens

  // A runway object defined to help with creating NEW runways
  runwayData: {
    episode: any;
    season: number;
    year: any;
    won: any;
    imagePath: any;
    votes: any;
    queen: any;
  } = {
    episode: 1, // default settings
    season: 1,
    year: 2008,
    won: false,
    imagePath: 'images/queen-name/runways/s#ep#.png',
    votes: 0,
    queen: 17, // Always associated with Bob the Drag Queen (id)
  };

  /**
   * This function gathers queens to display from the api
   */
  async fetchQueens() {
    try {
      // Get a response from the URL defined in mixin
      const response = await fetch(`${QUEEN_API}`);
      const queens = await response.json();
      this.queens = queens;
    } catch (error) {
      console.error('Error fetching queens:', error);
    }
  }

  mounted() {
    // Always load these functions
    this.fetchRunways();
    this.fetchQueens();
  }

  /**
   * This function gathers runways to display from the api
   */
  async fetchRunways() {
    try {
      // Get response from the URL defined in the mixin
      const response = await fetch(`${RUNWAY_API}`);
      const runways = await response.json();
      this.runways = runways;
    } catch (error) {
      console.error('Error fetching runways:', error);
    }
  }

  /**
   * This function helps to switch to a grid view
   */
  switchToGrid() {
    this.isGridLayout = true;
  }

  /**
   * This function helps to switch to a list view
   */
  switchToList() {
    this.isGridLayout = false;
  }

  /**
   * This function helps to pop up the delete modal
   * @param index
   */
  deleteRunwayModal(index: any) {
    // the index helps to identify the runway
    this.selectedRunwayIndex = index;
    // Show the modal with the dynamic id
    this.$bvModal.show(`deleteRunwayModal${index}`);
  }

  /**
   * This function helps to pop up the edit modal
   * @param index
   */
  editRunwayModal(index: any) {
    // Set these values to null to avoid displaying errors in the modal even after the user
    // closes the modal. The modal should be "reset"
    this.episodeErr = null;
    this.seasonErr = null;
    this.yearErr = null;
    this.wonErr = null;
    this.imageErr = null;
    this.queenErr = null;
    // the index helps to identify the runway
    this.selectedRunwayIndex = index;

    this.selectedRunway = this.runways[index];
    // show the modal with this dynamic id
    this.$bvModal.show(`editRunwayModal${index}`);
  }

  /**
   * This function helps to pop up the add modal
   */
  showAddModal() {
    // Set these values to null to avoid displaying errors in the modal even after the user
    // closes the modal. The modal should be "reset"
    this.episodeErr = null;
    this.seasonErr = null;
    this.yearErr = null;
    this.wonErr = null;
    this.imageErr = null;
    this.queenErr = null;
    // show the modal with the following id
    this.$bvModal.show('addRunwayModal');
  }

  /**
   * This function helps to change the vote icon to notify the user their vote has been casted
   * @param runway
   */
  async toggleVote(runway: any) {
    // if the user has not voted and the vote button is not disabled (disabled button means
    // the user has voted)
    if (!runway.voted && !runway.voteDisabled) {
      try {
        // fetch a response from the url defined in mixin
        const response = await fetch(`${RUNWAY_API}/${runway.id}/votes`, {
          method: 'PUT', // do an update/put
          headers: {
            // the cors headers to send to the api
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
          // Send a flag to indicate increasing the vote count
          body: JSON.stringify({ votes: 1 }),
        });
        // if we were able to update the votes
        if (response.ok) {
          // Vote successful, update the local state
          this.$set(runway, 'voted', true);
          this.$set(runway, 'voteDisabled', true);

          // Increase the local vote count
          this.$set(runway, 'votes', runway.votes + 1);

          // Enable the button after 30 minutes
          setTimeout(() => {
            this.$set(runway, 'voteDisabled', false);
          }, 30000);
        } else {
          console.error('Error voting:', response.statusText);
        }
      } catch (error) {
        console.error('Error voting:', error);
      }
    }
  }

  /**
   * This function helps to delete a runway from the database PERMANENTLY
   * @param index
   * @param runway
   */
  async confirmDelete(index: any, runway: any) {
    const runwayID = this.runways[index].id;
    try {
      // fetch a response from the url defined in the mixin
      const response = await fetch(`${RUNWAY_API}/${runwayID}`, {
        method: 'DELETE', // the method is to delete
        headers: {
          // the cors headers to send over to the api
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        // send the runway id to be deleted
        body: JSON.stringify(runwayID),
      });
      // if the delete was successful
      if (response.ok) {
        // hide the delete modal
        this.$bvModal.hide(`deleteRunwayModal${index}`);
        this.fetchRunways(); // Refresh the list of runways to show the new list
      } else {
        console.error('Error deleting runway:', response.statusText);

        try {
          const errorResponse = await response.json();
          console.error('Error response:', errorResponse);
        } catch (jsonError) {
          console.error('Error parsing JSON response:', jsonError);
        }
      }
    } catch (error) {
      console.error('Error deleting runway:', error);
    }
  }

  /**
   * This function helps to save a new runway to the database
   * @param runway
   */
  async saveAdd(runway: any) {
    try {
      // From the runway object passed into the function, define it in the newRunway object
      // These values are the values the user wants their new runway object to have
      const newRunway = {
        episode: parseInt(runway.episode, 10),
        season: parseInt(runway.season, 10),
        year: parseInt(runway.year, 10),
        won: runway.won,
        imagePath: runway.imagePath,
        votes: 0, // A new runway will always have 0 votes since it did not exist before in the
        // application
        queen: runway.queen,
      };

      // fetch a response from the url defined in the mixin
      const response = await fetch(`${RUNWAY_API}`, {
        method: 'POST', // method is to create/post
        headers: {
          // the cors headers the api accepts
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        // send over the newRunway object
        body: JSON.stringify(newRunway),
      });

      // If the runway was created successfully
      if (response.ok) {
        // make the errors to be null
        this.episodeErr = null;
        this.seasonErr = null;
        this.yearErr = null;
        this.wonErr = null;
        this.imageErr = null;
        this.queenErr = null;

        // hide the modal since the user is now finished with this task
        this.$bvModal.hide('addRunwayModal');
        this.fetchRunways(); // Refresh the list of queens after adding a new one
      } else {
        // There may be a problem with how the user defined their runway object
        // Help the user to understand why
        // Get the error response
        const errorResponse = await response.json();

        // From the error response, find if there is an error related to episode
        const epErr = errorResponse.errors.find((error: {
          property: string;
        }) => error.property === 'episode');

        // From the error response, find if there is an error related to season
        const seasErr = errorResponse.errors.find((error: {
          property: string;
        }) => error.property === 'season');

        // From the error response, find if there is an error related to winning
        const wonErr = errorResponse.errors.find((error: {
          property: string;
        }) => error.property === 'won');

        // From the error response, find if there is an error related to year
        const yearErr = errorResponse.errors.find((error: {
          property: string;
        }) => error.property === 'year');

        // From the error response, find if there is an error related to image path
        const imageErr = errorResponse.errors.find((error: {
          property: string;
        }) => error.property === 'imagePath');

        // From the error response, find if there is an error related to queen
        const queenErr = errorResponse.errors.find((error: {
          property: string;
        }) => error.property === 'queen');

        // if an error occurred for the episode
        if (epErr && epErr.constraints) {
          // display the errors
          this.episodeErr = epErr.constraints ? Object.values(epErr.constraints).join(', ')
            : 'Unknown error';
        }

        // if an error occurred for the year
        if (yearErr && yearErr.constraints) {
          this.yearErr = yearErr.constraints ? Object.values(yearErr.constraints).join(', ')
            : 'Unknown error';
        }

        // if an error occurred for the season
        if (seasErr && seasErr.constraints) {
          // display the errors
          this.seasonErr = seasErr.constraints ? Object.values(seasErr.constraints).join(', ')
            : 'Unknown error';
        }

        // if an error occurred for winning
        if (wonErr && wonErr.constraints) {
          // display the errors
          this.wonErr = wonErr.constraints.isBoolean;
        }

        // if an error occurred for the queen
        if (queenErr && queenErr.constraints) {
          // display the errors
          this.queenErr = queenErr.constraints ? Object.values(queenErr.constraints).join(', ')
            : 'Unknown error';
        }

        // if an error occurred for the image path
        if (imageErr && imageErr.constraints) {
          // display the errors
          this.imageErr = imageErr.constraints.matches;
        }
      }
    } catch (error) {
      console.error('Error adding runway in catch :', error);
    }
  }

  /**
   * This function helps to save the edits made to an existing runway
   * @param index
   * @param runway
   */
  async saveEdit(index: any, runway: any) {
    const runwayID = this.runways[index].id;
    console.log(`Runways episode:${runway.episode}`);
    try {
      // from the runway object passed into the function, collect its values
      const newRunway = {
        episode: parseInt(runway.episode, 10),
        season: parseInt(runway.season, 10),
        year: parseInt(runway.year, 10),
        won: runway.won,
        imagePath: runway.imagePath,
        votes: 0,
        queen: runway.queen,
      };

      const response = await fetch(`${RUNWAY_API}/${runwayID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(newRunway),
      });
      console.log(JSON.stringify(runway));

      if (response.ok) {
        this.episodeErr = null;

        this.seasonErr = null;

        this.yearErr = null;

        this.wonErr = null;

        this.imageErr = null;

        this.queenErr = null;

        this.$bvModal.hide(`editRunwayModal${index}`);

        this.fetchRunways(); // Refresh the list of queens after adding a new one
      } else {
        console.error('Error adding runway in try:', response.statusText);

        const errorResponse = await response.json();

        console.log(errorResponse);

        // Find the error related to queenName
        const epErr = errorResponse.errors.find((error: {
          property: string;
        }) => error.property === 'episode');
        const seasErr = errorResponse.errors.find((error: {
          property: string;
        }) => error.property === 'season');
        const wonErr = errorResponse.errors.find((error: {
          property: string;
        }) => error.property === 'won');
        const yearErr = errorResponse.errors.find((error: {
          property: string;
        }) => error.property === 'year');
        const imageErr = errorResponse.errors.find((error: {
          property: string;
        }) => error.property === 'imagePath');
        const queenErr = errorResponse.errors.find((error: {
          property: string;
        }) => error.property === 'queen');

        if (epErr && epErr.constraints) {
          this.episodeErr = epErr.constraints ? Object.values(epErr.constraints).join(', ')
            : 'Unknown error';
        }

        if (yearErr && yearErr.constraints) {
          this.yearErr = yearErr.constraints ? Object.values(yearErr.constraints).join(', ')
            : 'Unknown error';
        }

        if (seasErr && seasErr.constraints) {
          this.seasonErr = seasErr.constraints ? Object.values(seasErr.constraints).join(', ')
            : 'Unknown error';
        }

        if (wonErr && wonErr.constraints) {
          this.wonErr = wonErr.constraints.isBoolean;
        }

        if (queenErr && queenErr.constraints) {
          this.queenErr = queenErr.constraints ? Object.values(queenErr.constraints).join(', ')
            : 'Unknown error';
        }
        if (imageErr && imageErr.constraints) {
          this.imageErr = imageErr.constraints.matches;
        }
      }
    } catch (error) {
      console.error('Error saving runway in catch :', error);
    }
  }
}
</script>

<template>
  <div class="container mt-5">
    <!-- Title -->
    <h1>Runways</h1>
    <!-- Delete modal -->
    <b-modal :id="'deleteRunwayModal'+selectedRunwayIndex" :title="'Delete Runway'" hide-footer>
      <p>Are you sure you want to delete this runway ?</p>
      <div class="modal-footer d-flex justify-content-end">
        <!-- Delete modal's Cancel and Delete buttons -->
        <button @click="$bvModal.hide('deleteRunwayModal'+selectedRunwayIndex)"
                class="btn btn-outline-success">Cancel
        </button>
        <button @click="confirmDelete(selectedRunwayIndex, selectedRunway)"
                :disabled="accessLevel !== 'admin'" class="btn btn-outline-danger">Delete
        </button>
      </div>
    </b-modal>
    <!-- Edit form modal  -->
    <b-modal :id="'editRunwayModal' + selectedRunwayIndex" :title="'Edit Runway'" hide-footer>
      <!-- saveEdit() handles saving the edits -->
      <b-form @submit.prevent="saveEdit(selectedRunwayIndex, selectedRunway)">
        <!-- Edit episode -->
        <b-form-group
          label="Episode:"
          :label-for="'editEpisode' + selectedRunwayIndex"
          description="Episode number"
        >
          <b-input
            :id="'editEpisode' + selectedRunwayIndex"
            v-model="selectedRunway.episode"
            type="number"
            max="15"
            min="1"
            :name="'editEpisode' + selectedRunwayIndex"
            :class="{'is-invalid': episodeErr}"
            required
          ></b-input>
          <div v-if="episodeErr" class="text-danger">{{ episodeErr }}</div>
        </b-form-group>
        <!-- Edit season -->
        <b-form-group
          label="Season:"
          :label-for="'editSeason' + selectedRunwayIndex"
          description="Season number"
        >
          <b-input
            id="'editSeason' + selectedRunwayIndex"
            v-model="selectedRunway.season"
            type="number"
            max="15"
            min="1"
            :name="'editSeason' + selectedRunwayIndex"
            :class="{'is-invalid': seasonErr}"
            required
          ></b-input>
          <div v-if="seasonErr" class="text-danger">{{ seasonErr }}</div>
        </b-form-group>
        <!-- Edit year -->
        <b-form-group
          label="Year:"
          :label-for="'editYear' + selectedRunwayIndex"
          description="Year of the runway"
        >
          <b-input
            id="'editYear' + selectedRunwayIndex"
            v-model="selectedRunway.year"
            type="number"
            :name="'editYear' + selectedRunwayIndex"
            :class="{'is-invalid': yearErr}"
            max="2023"
            min="2008"
            required
          ></b-input>
          <div v-if="yearErr" class="text-danger">{{ yearErr }}</div>
        </b-form-group>
        <!-- Edit image path -->
        <b-form-group
          label="Image path:"
          label-for="editImage"
          description="Path to the image"
        >
          <b-input
            id="editImage"
            v-model="selectedRunway.imagePath"
            type="text"
            name="editImage"
            :class="{'is-invalid': imageErr}"
            required
          ></b-input>
          <div v-if="imageErr" class="text-danger">{{ imageErr }}</div>
        </b-form-group>
        <!-- Edit queen -->
        <b-form-group
          label="Queen:"
          :label-for="'editQueen' + selectedRunwayIndex"
          description="Select the queen"
        >
          <b-form-select
            id="'editQueen' + selectedRunwayIndex"
            v-model="selectedRunway.queen"
            :name="'editQueen' + selectedRunwayIndex"
            :class="{'is-invalid': queenErr}"
          >
            <b-form-select-option
              v-for="queen in queens"
              :key="queen.id"
              :value="queen.id"
            >
              {{ queen.queenName }}
            </b-form-select-option>
          </b-form-select>
          <!-- Display errors if any -->
          <div v-if="queenErr" class="text-danger">{{ queenErr }}</div>
        </b-form-group>
        <!-- Edit win status -->
        <b-form-group
          label="Did this runway win its challenge"
          :label-for="'editWon'+selectedRunwayIndex"
        >
          <b-form-checkbox
            v-model="selectedRunway.won"
            :name="'editWon' + selectedRunwayIndex"
            :id="'editWon' + selectedRunwayIndex"
            :class="{'is-invalid': wonErr}"
          >
            Yes, this runway won its challenge
          </b-form-checkbox>
          <div v-if="wonErr" class="text-danger">{{ wonErr }}</div>
        </b-form-group>
        <!-- Cancel and Save Button -->
        <div class="modal-footer d-flex justify-content-end">
          <b-button
            class="mt-3"
            variant="outline-primary"
            type="button"
            @click="$bvModal.hide('editRunwayModal' + selectedRunwayIndex)"
          >
            Cancel
          </b-button>
          <b-button
            class="mt-3"
            variant="outline-success"
            type="button"
            @click="saveEdit(selectedRunwayIndex, selectedRunway)"
            :disabled="accessLevel !== 'admin'"
          >
            Save
          </b-button>
        </div>
      </b-form>
    </b-modal>
    <!-- Add new runway modal --->
    <b-modal :id="'addRunwayModal'" :title="'Add Runway'" hide-footer>
      <!-- Modals submits to saveAdd() --->
      <b-form @submit.prevent="saveAdd(runwayData)">
        <!-- Add new episode --->
        <b-form-group
          label="Episode:"
          label-for="addEpisode"
          description="Episode number"
        >
          <b-input
            id="addEpisode"
            v-model="runwayData.episode"
            type="number"
            :class="{'is-invalid': episodeErr}"
            max="15"
            min="1"
            required
          ></b-input>
          <div v-if="episodeErr" class="text-danger">{{ episodeErr }}</div>
        </b-form-group>
        <!-- Add new season --->
        <b-form-group
          label="Season:"
          label-for="addSeason"
          description="Season number"
        >
          <b-input
            id="addSeason"
            v-model="runwayData.season"
            type="number"
            :class="{'is-invalid': seasonErr}"
            max="15"
            min="1"
            required
          ></b-input>
          <div v-if="seasonErr" class="text-danger">{{ seasonErr }}</div>
        </b-form-group>
        <!-- Add new year --->
        <b-form-group
          label="Year:"
          label-for="addYear"
          description="Year of the runway"
        >
          <b-input
            id="addYear"
            v-model="runwayData.year"
            type="number"
            :class="{'is-invalid': yearErr}"
            max="2023"
            min="2008"
            required
          ></b-input>
          <div v-if="yearErr" class="text-danger">{{ yearErr }}</div>
        </b-form-group>
        <!-- Add new image path --->
        <b-form-group
          label="Image path:"
          label-for="addImage"
          description="Path to the image"
        >
          <b-input
            id="addImage"
            v-model="runwayData.imagePath"
            type="text"
            :class="{'is-invalid': imageErr}"
            required
          ></b-input>
          <div v-if="imageErr" class="text-danger">{{ imageErr }}</div>
        </b-form-group>
        <!-- Add queen to the runway --->
        <b-form-group
          label="Queen:"
          label-for="addQueen"
          description="Select the queen"
        >
          <b-form-select
            id="addQueen"
            v-model="runwayData.queen"
            :class="{'is-invalid': queenErr}"
          >
            <b-form-select-option
              v-for="queen in queens"
              :key="queen.id"
              :value="queen.id"
            >
              {{ queen.queenName }}
            </b-form-select-option>
          </b-form-select>
          <div v-if="queenErr" class="text-danger">{{ queenErr }}</div>
        </b-form-group>
        <!-- Add win status --->
        <b-form-group
          label="Did this runway win its challenge"
          label-for="addWon"
        >
          <b-form-checkbox
            v-model="runwayData.won"
            id="addWon"
            :class="{'is-invalid': wonErr}"
          >
            Yes, this runway won its challenge
          </b-form-checkbox>
          <div v-if="wonErr" class="text-danger">{{ wonErr }}</div>
        </b-form-group>
        <!-- Cancel and Save button for the modal--->
        <div class="modal-footer d-flex justify-content-end">
          <b-button
            class="mt-3"
            variant="outline-primary"
            type="button"
            @click="$bvModal.hide('addRunwayModal')"
          >
            Cancel
          </b-button>
          <b-button
            class="mt-3"
            variant="outline-success"
            type="submit"
            :disabled="accessLevel !== 'admin'"
          >
            Save
          </b-button>
        </div>
      </b-form>
    </b-modal>
    <div class="row">
      <div class="col-md-6 text-left">
        <!-- Add Queen Button -->
        <button @click="showAddModal" :disabled="accessLevel !== 'admin'" class="btn btn-link ">
          <i class="fa-solid fa-circle-plus"></i> Add Runway
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

    <!-- Grid View -->
    <div v-if="isGridLayout">
      <div class="row">
        <!-- Loop through the runways -->
        <div v-for="(runway, index) in runways" :key="index" class="col-md-6 mb-3">
          <div v-if="index < runways.length" class="card border-light mb-4">
            <!-- Hold each runway object in a card -->
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <img :src="runway.imagePath" class="card-img-top" alt="Runway Image"
                       style="width: 220px; height: 330px;"/>
                </div>
                <div class="col-md-6">
                  <h4 class="runway-details">
                    <p>{{ runway.queen }}</p>
                    Season {{ runway.season }}, Episode {{runway.episode}} ({{runway.year}})

                  </h4>
                  <h4 class="py-2">
                    Votes: {{ runway.votes }}
                    <!-- Vote button linked to toggleVote(), checks if voted or not -->
                    <button @click="() => toggleVote(runway)"
                            :disabled="runway.voted || runway.voteDisabled" class="btn btn-link">
                      <i class="fa-2x fa"
                         :class="{'fa-regular fa-heart': !runway.voted, 'fa-solid fa-heart':
                           runway.voted, 'fa-beat': !runway.voted}"
                         style="color: #ff006f;"></i>
                    </button>
                  </h4>
                  <h4 class="py-2">
                    <!-- Transform the true or false boolean into yes or no -->
                    Won: {{runway.won ? 'Yes' : 'No'}}
                  </h4>
                  <div class="mt-5 pr-4 text-right">
                    <!-- The following buttons are disabled if the user is not admin -->
                    <button @click="editRunwayModal(index)"
                            :disabled="accessLevel !== 'admin'"
                            class="btn btn-link btn-lg btn-outline-primary">
                      <i class="fa-solid fa-pencil fa-bounce fa-2xl" style="color: #ffa200;"></i>
                    </button>
                    <button @click="deleteRunwayModal(index)"
                            :disabled="accessLevel !== 'admin'"
                            class="btn btn-link btn-lg btn-outline-danger">
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
    <!-- List View -->
    <div v-else>
      <!-- Loop through the runways -->
      <div v-for="(runway, index) in runways" :key="index" class="col-md-12 mb-3">
        <div v-if="index < runways.length" class="card border-light mb-4">
          <div class="card-body">
            <div class="row">
              <div class="col-md-4">
                <img :src="runway.imagePath" class="card-img-top" alt="Runway Image"/>
              </div>
              <div class="col-md-8">
                <h2 class="runway-details">
                  Season {{runway.season}}, Episode {{runway.episode}} ({{runway.year}})
                </h2>
                <h4 class="py-2">
                  Votes: {{runway.votes}}
                  <!-- Vote button linked to toggleVote(), checks if voted or not -->
                  <button @click="() => toggleVote(runway)"
                          :disabled="runway.voted || runway.voteDisabled" class="btn btn-link">
                    <i class="fa-2x fa"
                       :class="{'fa-regular fa-heart': !runway.voted, 'fa-solid fa-heart':
                         runway.voted, 'fa-beat': !runway.voted}"
                       style="color: #ff006f;"></i>
                  </button>
                </h4>
                <h4 class="py-2">
                  <!-- Transform the true or false boolean into yes or no -->
                  Won: {{runway.won ? 'Yes' : 'No'}}
                </h4>
                <div class="mt-5 pr-4 text-right">
                  <!-- The following buttons are disabled if the user is not admin -->
                  <button @click="editRunwayModal(index)"
                          :disabled="accessLevel !== 'admin'"
                          class="btn btn-link btn-lg btn-outline-primary">
                    <i class="fa-solid fa-pencil fa-bounce fa-2xl" style="color: #ffa200;"></i>
                  </button>
                  <button @click="deleteRunwayModal(index)"
                          :disabled="accessLevel !== 'admin'"
                          class="btn btn-link btn-lg btn-outline-danger">
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
</template>

<style scoped>

</style>
