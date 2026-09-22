/*

  <:3)~
   ^
   |
Horácio

*/

const max_hp = 2;
const max_ammo = 6;
const max_battery = 60;
const effective_heal = 1;
const fps = 24;
const blast_radius_low = 50;
const blast_radius_high = 100;

let blast_radius = blast_radius_low;

const flashlight_radius_low = 128;
const flashlight_radius_high = 256;
let flashlight_radius = flashlight_radius_low;

const light_radius_low = 75;
const light_radius_high = 150;
let light_radius = light_radius_low;

class Player {
  constructor() {
    this.health = 2;
    this.inventory = [];
  }
}

class Flashlight {
  constructor() {
    this.battery = max_battery * fps;
    this.is_on = false;
  }

  use_primary() {
    if (this.is_on == true) {
      light_off();

      this.is_on = false;
      return;
    }

    if (this.battery <= 0) return;

    lights_on();
    this.is_on = true;
  }

  use_secondary() {
    this.battery += fps / 10; // 500 coin batteries
  }

  battery_decay() {
    if (this.is_on == false) return;
    this.battery--;
    if (this.battery <= 0) this.use_primary();
  }

  flash_enemies() {
    if (this.is_on == false) return;
    enemies_in_sight = shine(mouse_x, mouse_y, light_radius);

    for (const i in enemies_in_sight) {
      i.hit_by_light();
    }
  }
}

class Shotgun {
  constructor() {
    this.chambering = 0;
    this.ammo = max_ammo;
  }

  use_primary() {
    if (this.chambering > 0) return;
    if (this.ammo <= 0) return;

    const enemies_hit = shoot(mouse_x, mouse_y, blast_radius);
    for (const i of enemies_hit) {
      i.hit();
    }

    this.ammo--;
    this.chambering = 1 * fps;
  }

  chamber_ammo() {
    if (this.chambering > 0) {
      this.chambering--;
    }
  }

  use_secondary() {
    if (this.ammo < max_ammo) {
      this.chambering = fps / 100;
      setTimeout(() => {}, 500 / fps);

      this.ammo++;
    }
  }
}

class Heal {
  constructor(hp) {
    this.hp = hp;
    this.quantity = 1;
  }

  use_primary() {
    if (this.quantity <= 0) return;
    if (player.health >= max_hp) return;

    player.health++;
    this.quantity--;
  }

  use_secondary() {
    enemies_hit = shoot();

    for (const i in enemies_hit) {
      i.hit(5);
    }
    return;
  }
}

let player = new Player();
let shotgun = new Shotgun();
let heal = new Heal(effective_heal);
let flashlight = new Flashlight();

player.inventory.push(shotgun);
player.inventory.push(heal);
player.inventory.push(flashlight);

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
  if (current_scene_id == SCENE_BAIXO) {
    blast_radius = blast_radius_high;
    light_radius = light_radius_high;
    flashlight_radius = flashlight_radius_high;
  } else {
    blast_radius = blast_radius_low;
    light_radius = light_radius_low;
    flashlight_radius = flashlight_radius_low;
  }
});

document.addEventListener("mousemove", (event) => {
  get_mouse_pos(event);
  if (flashlight.is_on == true) move_flashlight(mouse_x, mouse_y);

  flashlight.flash_enemies();
});

function update() {
  shotgun.chamber_ammo();
  if (flashlight.is_on == true) flashlight.battery_decay();

  update_scene();
}

setInterval(update, 1000 / fps);

