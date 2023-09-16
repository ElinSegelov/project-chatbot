
// DOM selectors
const chat = document.getElementById('chat');
const replyForm = document.getElementById('reply-form');
const inputWrapper = document.querySelector(".input-wrapper");
const entireScreen = document.querySelector("#body-id");
const submitButton = document.querySelector(".send-btn");
const inputField = document.querySelector("#name-input");
const inventory = document.querySelector(".inventory");
const inventoryItems = document.querySelectorAll(".inventory-item");
const heart = document.querySelectorAll(".heart");
const hpContainer = document.querySelector(".hp-container");
const nameSpan = document.querySelector("#name-span");

// Global variables
let pathChoices;
let intersectionCounter = 0;
const hero = {
  name: '',
  healthPoints: 2,
  inventory: []  
}

fetch('data.json')
  .then(response => response.json())
  .then(data => {
    pathChoices = data;
  })
  .catch(error => console.error('Failed to fetch JSON', error)
);

// Helper function to generate chat messages
const generateChatHTML = (message, senderType, senderIcon) => `
  <section class="message ${senderType}-msg">
    <img src="./src/assets/images/${senderIcon}.png" alt="${senderType}" />
    <div class="bubble ${senderType}-bubble">
      <p>${message}</p>
    </div>
  </section>
`;

// Generating messages
const showMessage = (message, sender) => {
  const senderType = sender === 'user' ? 'user' : 'bot';
  const senderIcon = sender === 'user' ? 'user' : 'bot';
  chat.innerHTML += generateChatHTML(message, senderType, senderIcon);
  
  // Makes the chat scroll to the last message when there are too many to be shown in the chat box
  chat.scrollTop = chat.scrollHeight;
};

const updateHeroPanel = (usedItem) => {
  let itemsInInventory;
  
  if (hero.healthPoints < 2) {
    const consumedHp = document.getElementById(`hp${(hero.healthPoints) + 1}`);
    consumedHp.classList.add('item-consumed')
  }
  
  if (usedItem) {
    const consumedItem = document.getElementById(usedItem);
    if (consumedItem) {
      consumedItem.classList.add('item-consumed');
    }
  } else {
    itemsInInventory = hero.inventory.map((item) => {  
      return (
        `<span
        id=${item.id}
        class="inventory-item first-item">
        ${item.icon}
        </span>`
        )
    })
    inventory.insertAdjacentHTML("beforeend", itemsInInventory.join(''))
  }
}

const greeting = () => {
  showMessage("Greatings, adventurer! I am your narrator. What is your name?", 'bot');
}

setTimeout(() => greeting(), 1000);

replyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  hero.name = inputField.value; // Sets value to heros name 
  showMessage(`Hi there, I'm ${hero.name} and I'm always up for a quest!`, "user"); 

  const newSpan = document.createElement("span");
  newSpan.innerHTML = hero.name;
  inputWrapper.innerHTML = "";
  nameSpan.insertAdjacentElement("beforeend", newSpan);

  setTimeout(() => displayChoices(0), 2000);
})

//! ------------------------- displayChoices ---------------------------
const displayChoices = (currentIntersection) => {
  const intersection = pathChoices.find((item) => item.intersection === currentIntersection);
  console.log(intersection)
  showMessage (intersection.question,"bot");

  // Special case for rendering select element instead of buttons
  if (intersection.intersection === 0) {
    const firstItem = intersection.options[0].items.map((item) => {
      return (`
        <option value=${item.id}>${item.text}</option>
      `)
    })
    const secondItem = intersection.options[1].items.map((item) => {
      return (`
        <option value=${item.id}>${item.text}</option>
      `)
    })
    inputWrapper.innerHTML = `
      <form id=item-form>
        <select id="first-item">
          <option value="" selected disabled>First item</option>
          ${firstItem}
        </select>
        <select id="second-item">
          <option value="" selected disabled>Second item</option>
          ${secondItem}
        </select>
        <button type='submit' id="select-item-btn">Add to backpack</button>
      </form>
      `;
    const itemForm = document.getElementById("item-form");
    const itemList1 = document.getElementById("first-item");
    const itemList2 = document.getElementById("second-item");

    itemForm.addEventListener("submit", (event) => {
      event.preventDefault();
      // the value of the selected option in respective list is assign to variables and added to heros inventory.
      const firstItem = pathChoices[currentIntersection].options[0].items.find((item) => item.id === itemList1.options[itemList1.selectedIndex].value);
      const secondItem = pathChoices[currentIntersection].options[1].items.find((item) => item.id === itemList2.options[itemList2.selectedIndex].value);
      console.log(firstItem)
      console.log(secondItem)
      //const secondItem = itemList2.options[itemList2.selectedIndex].value;
      hero.inventory.push(firstItem, secondItem)
      
      updateHeroPanel();

      inputWrapper.innerHTML = ``;

      showMessage (`I choose the ${hero.inventory[0].text} and the ${hero.inventory[1].text}`, 'user');
      setTimeout(() => displayChoices(currentIntersection +1), 1200);
      intersectionCounter++;
    }) 
  } else {
    const allOptions = intersection.options.map((option) => {
      return (`
        <button class="choice-button" id=${option.id}>${option.text}</button>
      `)
    })
    inputWrapper.innerHTML = `
      ${allOptions.join('')}
    `;
  }
  
  // Add eventlistener to buttons and depending on the current intersection, 
  // display user reply based on players choice.
  const choiceButtons = document.querySelectorAll(".choice-button");
  choiceButtons.forEach(button => button.addEventListener("click", (event) => {
    inputWrapper.innerHTML = "";
    switch (intersection.intersection) {
      case 1 :
        showMessage(`I will go through the ${event.target.innerHTML}`, "user");
        break;
      case 2:
        showMessage(`I will ${event.target.id}`, "user");
        console.log('svaret', event.target.id);
        break;
      case 3 :
        showMessage(`I will ${event.target.innerHTML} the dragon`, "user"); 
        break;
      case 4 :
        showMessage(`I will take the ${event.target.id} with me!`, "user"); 
        break;
    }
    setTimeout(() => pathChoice(event.target.id), 2000);
  }))
} 

//! ------------------------- pathChoice ---------------------------
const pathChoice = (id) => {
  // Finding the selected path for the current intersection
  console.log('pathChoices[intersectionCounter]', pathChoices[intersectionCounter]);
  const currentPath = pathChoices[intersectionCounter].paths.find((path) => path.name === id);
  intersectionCounter ++;

  //Special cases where we don't check for items in inventory
  if (id === 'continue') {
    showMessage(currentPath.goodMessage,`bot`); 
  } else if (id === 'resign') {
    showMessage(currentPath.failMessage,`bot`); 
    setTimeout(() => gameOver(), 2000);
  } else if (id === 'puppy') {
    showMessage(currentPath.goodMessage,`bot`); 
    setTimeout(() => finalScene(), 2000)
  } else if (id === 'treasure') {
    showMessage(currentPath.failMessage,`bot`); 
    setTimeout(() => gameOver(), 2000)
  } else {
    //Checking for items in inventory
    if (hero.inventory.some((item) => item.id === currentPath.goodItem)) {
      setTimeout( () => {
        showMessage(currentPath.goodMessage,`bot`); 
        updateHeroPanel(currentPath.goodItem);
        setTimeout( () => {showMessage(`I'm feeling good about this!`,`user`)}, 3500);  
      }, 1800);
    } else if (hero.inventory.some((item) => item.id === currentPath.okItem)) {
      setTimeout( () => { 
        hero.healthPoints -= 1;
        showMessage(currentPath.okMessage,`bot`); 
        updateHeroPanel(currentPath.okItem)
        console.log('hp vid ok item', hero.healthPoints)
        if (hero.healthPoints === 0) {
          setTimeout( () => {deathBy0Hp()}, 3000);
        } else {
          //TODO replace with showing a heart disapperaing from hp bar
          setTimeout( () => {showMessage(`Oh... it hurts!`,`user`)}, 3500);
        }
      }, 1800);
    } else {
      hero.healthPoints = 0;
      showMessage(currentPath.failMessage,`bot`); 
      setTimeout(() => deathBy0Hp(), 3000);
    }
  }
  
  if (hero.healthPoints > 0 && id !== 'puppy' || id !== 'treasure') {
    setTimeout(() => displayChoices(intersectionCounter), 8000)
  } else if (hero.healthPoints === 0) {
    setTimeout( () => { 
      showMessage(currentPath.failMessage,`bot`); 
    }, 1800);
    setTimeout(gameOver, 8000);
  }
}

const finalScene = () => {
  setTimeout(showMessage
    (`As you exit throught the castles back doors and thinking of what you have endured, you knew the ${hero.inventory[0].text} and ${hero.inventory[1].text} would come in handy.
    You see a helicopter with its engine running idly. You get in to the helicopter and fly your self and the puppy to safety...`,
    'bot'), 2000
  )
  setTimeout(endScreen, 10000)
}

const deathBy0Hp = () => {
  if(hero.healthPoints === 0) {
    showMessage(`Your injuries are too severe. You die! ☠️`, 'bot');
    setTimeout(gameOver, 3500);
  }
}

const endScreen = () => {
  entireScreen.innerHTML=`
    <div class="end-content-wrapper">
      <div class="end-content-header">
        <h1>The Lost Bark:</h1>
        <h2>Quest for a lost pup<h2>
        <p>Mission accomplished!<p>
      </div>  
      <div class="flex-center-center animation-container">
        <lottie-player
        src="https://lottie.host/21b8bbbc-edc9-4faf-8d69-6e41343a4b7f/dWMdlHrQIt.json"
        background="transparent" speed="1" style="width: 250px; height: 250px;" loop autoplay>
        </lottie-player>
      </div>
      
      <div class="flex-column-center-center end-screen-container">
        <p>Well done ${hero.name}! You put your ${hero.inventory[0].text} and ${hero.inventory[1].text}
          to good use and got past the dragon.</p>
        <p>You turn on the autopilot of the helicopter, untie the puppys feet and get some well deserved puppy love!</p>
        
        <button class="replay-btn">Play again</button>
        <p class="attribution">
          <a href="https://icons8.com/icon/JgMkyDIhH9gy/dog">Puppy</a>,
          <a href="https://icons8.com/icon/4DpNVfpKdNK1/heart">Heart</a>,
          <a href="https://icons8.com/icon/ZWlC2P8mA86Z/bot">Bot</a> and
          <a href="https://icons8.com/icon/dXwOpjDM5Gw4/adventurer">Adventurer</a>
          icons by <a href="https://icons8.com">Icons8</a>
        </p>
      </div>
    </div> 
  `
  const retryButton = document.querySelector(".replay-btn");
  retryButton.addEventListener("click", () => {
    location.reload();
  })
}

const gameOver = () => {
  entireScreen.innerHTML = `
    <div class="gameover-wrapper">
      <h1 class="game-over">💀 GAME OVER 💀</h1>
      <button class="retry-btn">Try again</button>
    </div> 
  `
  const retryButton = document.querySelector(".retry-btn");
  retryButton.addEventListener("click", () => {
    location.reload();
  })
}