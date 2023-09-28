const playerContainer = document.getElementById('all-players-container');
const newPlayerFormContainer = document.getElementById('new-player-form');

// Add your cohort name to the cohortName variable below, replacing the 'COHORT-NAME' placeholder
const cohortName = '2302-ACC-ET-WEB-PT-D';
// Use the APIURL variable for fetch requests
const APIURL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}/`;

/**
 * It fetches all players from the API and returns them
 * @returns An array of objects.
 */
const fetchAllPlayers = async () => {
    try {
        const response = await fetch(`${APIURL}/players`);

        if (!response.ok) {
            throw new Error(`Failed to fetch players (HTTP status: ${response.status})`);
        }

        const players = await response.json();
        return players;
        
    } catch (err) {
        console.error('Uh oh, trouble fetching players!', err);
    }
};

const fetchSinglePlayer = async (playerId) => {
    try {
        const response = await fetch(`${APIURL}/players/${playerId}`);
        const playerResponse = await response.json();;

        const player = playerResponse.data.player;

        console.log(player);

        if (!response.ok) {
            throw new Error(`Failed to fetch player (HTTP status: ${response.status})`);
        }


        // Display the player details
        const playerDetailsHTML = `
            <div class="player-card">
                <h2>Player Details</h2>
                <p>ID: ${player.id}</p>
                <p>Name: ${player.name}</p>
                <p>Breed: ${player.breed}</p>
                <p>Team ID: ${player.teamId}</p>
                <p><img src="${player.imageUrl}" alt="Puppy Image" class="images"></p>
                <button id="back-button">Back</button>
            </div>
        `;

        
        const playerDetailsContainer = document.getElementById('player-details-container');
        playerDetailsContainer.innerHTML = playerDetailsHTML;

        // Add a click event listener to the "Back" button
        const backButton = document.getElementById('back-button');
        backButton.addEventListener('click', () => {
            // Clear the player details container
            playerDetailsContainer.innerHTML = '';
        });

    } catch (err) {
        console.error(`Oh no, trouble fetching player #${playerId}!`, err);
    }
};

const addNewPlayer = async (playerObj) => {
    try {
        const response = await fetch(`${APIURL}/players`, 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(playerObj),
        });

        if (!response.ok) {
            throw new Error(`Failed to add a new player (HTTP status: ${response.status})`);
        }

        const addedPlayer = await response.json();
        console.log(addedPlayer);

        const players = await fetchAllPlayers();
        renderAllPlayers(players);

    } catch (err) {
        console.error('Oops, something went wrong with adding that player!', err);
    }
};

const removePlayer = async (playerId) => {
    try {
        const response = await fetch(`${APIURL}/players/${playerId}`,
        {
            method: 'DELETE',
        }
    );
    
        const players = await fetchAllPlayers();
        renderAllPlayers(players);

    } catch (err) {
        console.error(
            `Whoops, trouble removing player #${playerId} from the roster!`,
            err
        );
    }
};

/**
 * It takes an array of player objects, loops through them, and creates a string of HTML for each
 * player, then adds that string to a larger string of HTML that represents all the players. 
 * 
 * Then it takes that larger string of HTML and adds it to the DOM. 
 * 
 * It also adds event listeners to the buttons in each player card. 
 * 
 * The event listeners are for the "See details" and "Remove from roster" buttons. 
 * 
 * The "See details" button calls the `fetchSinglePlayer` function, which makes a fetch request to the
 * API to get the details for a single player. 
 * 
 * The "Remove from roster" button calls the `removePlayer` function, which makes a fetch request to
 * the API to remove a player from the roster. 
 * 
 * The `fetchSinglePlayer` and `removePlayer` functions are defined in the
 * @param playerList - an array of player objects
 * @returns the playerContainerHTML variable.
 */
const renderAllPlayers =  (response) => {
    try {
        playerContainer.innerHTML = ''

        const playerList = response.data.players;
        
        playerList.forEach((player) => {
            const playerHTML = document.createElement('div');
            playerHTML.classList.add('player-card');
            playerHTML.innerHTML = `
                        <img src="${player.imageUrl}" class="images">
                        <p>Name: ${player.name}</p>
                        <p>ID: ${player.id}</p>
                        <div class="button-footer">
                            <button class="see-detail-button" data-player-id="${player.id}">See Details</button>
                            <button class="remove-button">Remove</button> 
                        </div> 
                `;

            const seeDetailsButton = playerHTML.querySelector('.see-detail-button');
            const removeButton = playerHTML.querySelector('.remove-button');

            seeDetailsButton.addEventListener('click', () => {
                const playerId = seeDetailsButton.getAttribute('data-player-id');
                console.log('See Details button clicked for player ID:', playerId);
                
                fetchSinglePlayer(player.id);
            });

            removeButton.addEventListener('click', () => {
                removePlayer(player.id);
            });

            playerContainer.appendChild(playerHTML);
        });

        
    } catch (err) {
        console.error('Uh oh, trouble rendering players!', err);
    }
};


/**
 * It renders a form to the DOM, and when the form is submitted, it adds a new player to the database,
 * fetches all players from the database, and renders them to the DOM.
 */
const renderNewPlayerForm = () => {
    try {
        newPlayerFormContainer.innerHTML = `
        <div class="form-container">
            <form id="add-player-form">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required> <br>
                <label for="breed">Breed:</label>
                <input type="text" id="breed" breed="breed" required> <br>
                <label for="imageURL">Image URL:</label>
                <input type="text" id="imageURL" name="imageURL" required> <br>
                <label for="teamID">Team ID:</label>
                <input type="text" id="teamID" name="teamID" required> <br>
                <button type="submit">Add Player</button>
            </form>
        </div>
        `;

        const addPlayerForm = document.getElementById('add-player-form');
        addPlayerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('name');
            const breedInput = document.getElementById('breed');
            const imageURLInput = document.getElementById('imageURL');
            const teamIDInput = document.getElementById('teamID');

            const playerObj = {
                name: nameInput.value,
                breed: breedInput.value,
                imageURL: imageURLInput.value,
                teamID: teamIDInput.value,
            };

            await addNewPlayer(playerObj);

            // Clear the form inputs
            nameInput.value = '';
            breedInput.value = '';
            imageURLInput.value = '';
            teamIDInput.value = '';
        });
        
    } catch (err) {
        console.error('Uh oh, trouble rendering the new player form!', err);
    }
}

const init = async () => {

    try {
        const response = await fetchAllPlayers();
        //console.log(response);

        renderAllPlayers(response);

        renderNewPlayerForm();
        
    } catch (err) {
        console.error('Uh oh, trouble initializing!', err);
    }

    playerContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('see-detail-button')) {
            const playerId = e.target.getAttribute('data-player-id'); // Get the player ID from data attribute
            console.log('See Details button clicked for player ID:', playerId); // Add this line for debugging
            fetchSinglePlayer(playerId);
        }
    });
    
}

init();
