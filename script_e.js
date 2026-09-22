/*

  <:3)~
   ^
   |
Horácio

*/

const fps = 24;

class Player {
  constructor() {
    this.health = 2;
    this.inventory = [];
  }
}

class Flashlight {
  constructor() {
    this.battery = 60 * fps;
  }

  battery_decay() {
    this.battery--;
  }
}

class Item {
  constructor() {}

  use_primary() {}

  use_secondary() {}
}

class Shotgun extends Item {
  constructor() {
    super();
    this.ammo = 6;
  }

  use_primary() {
    const enemies_hit = shoot(mouse_x, mouse_y, 50);

    for (const i of enemies_hit) {
      i.hit();
    }

    this.ammo--;
  }

  use_secondary() {
    if (this.ammo <= 6) {
      this.ammo++;
    }
  }
}

class Heal extends Item {
  constructor(hp) {
    super();
    this.hp = hp;
    this.quantity = 1;
  }

  use_primary(player) {
    player.health++;
  }

  use_secondary() {
    if (this.ammo <= 6) {
      ammo++;
    }
  }
}

let player = new Player();
let shotgun = new Shotgun();
let heal = new Heal(1);
let flashlight = new Flashlight();

player.inventory.push(shotgun);
player.inventory.push(heal);

let current_item = 0;

let mouse_x;
let mouse_y;

function get_mouse_pos(event) {
  mouse_x = event.clientX;
  mouse_y = event.clientY;
}

document.addEventListener("click", (e) => {
  get_mouse_pos(e);
  player.inventory[current_item].use_primary();
});

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();

  get_mouse_pos(e);
  player.inventory[current_item].use_secondary();
  return false;
});

document.addEventListener("keydown", (event) => {
  if (event.key == "q") {
    swap_to_left_scene();
  } else if (event.key == "e") {
    swap_to_right_scene();
  }
});

function update() {
  flashlight.battery_decay();

  setTimeout(update, 1000 / fps);
}

setTimeout(update, 1000 / fps);
