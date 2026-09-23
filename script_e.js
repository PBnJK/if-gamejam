/*

  <:3)~
   ^
   |
Horácio

*/

play_button = document.getElementById("play");

let on_menu = true;

const max_hp = 2;
const max_ammo = 6;
const max_battery = 150;
const effective_heal = 1;
const fps = 24;
const blast_radius_low = 50;
const blast_radius_high = 100;

let blast_radius = blast_radius_low;

const flashlight_radius_low = 150;
const flashlight_radius_high = 350;
let flashlight_radius = flashlight_radius_low;

const light_radius_low = 75;
const light_radius_high = 150;
let light_radius = light_radius_low;

class Player {
  constructor() {
    this.health = 2;
    this.inventory = [];
  }

  hit() {
    this.health--;
  }
}

class Flashlight {
  constructor() {
    this.battery = max_battery;
    this.is_on = true;
  }

  use_primary() {
    play_sound("assets/audio/sfx/on_off_flashlight.mp3");

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
    if (this.battery > max_battery || this.is_on == true) return;
    this.battery += fps / 2; // 500 coin batteries
    setTimeout(() => {}, 100 / fps);
    play_sound("assets/audio/sfx/add_battery.mp3");
  }

  battery_decay() {
    if (this.is_on == false) return;
    this.battery--;
    if (this.battery <= 0) this.use_primary();
  }

  flash_enemies() {
    if (this.is_on == false) return;
    const enemies_in_sight = shine(mouse_x, mouse_y, light_radius);

    if (enemies_in_sight.length != 0) {
      let seen = false;
      for (const i of enemies_in_sight) {
        if (i.seen) {
          seen = true;
        } else {
          i.seen = true;
        }

        i.hit_by_light();
      }

      if (seen) {
        play_sound("assets/audio/sfx/scare.mp3");
      }
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

    muzzle_flash();
    play_sound("assets/audio/sfx/shotgun_shot.mp3");
    for (const i of enemies_hit) {
      i.hit();
      play_sound("assets/audio/sfx/bullet_hit.mp3");
    }

    this.ammo--;
    this.chambering = 1 * fps;

    setTimeout(() => {}, 300 / fps);
    play_sound("assets/audio/sfx/shotgun_shell.mp3");
  }

  chamber_ammo() {
    if (this.chambering > 0) {
      this.chambering--;
    }
  }

  use_secondary() {
    if (this.ammo < max_ammo) {
      this.chambering = fps / 100;
      play_sound("assets/audio/sfx/reload.mp3");

      this.ammo++;
    }
  }
}

class Heal {
  constructor(hp) {
    this.hp = hp;
    this.quantity = 1;
  }

  use_primary(player) {
    if (this.quantity <= 0) return;
    if (player.health >= max_hp) return;

    play_sound("assets/audio/sfx/injection.mp3");
    player.health++;
    this.quantity--;
  }

  use_secondary() {
    enemies_hit = shoot();
    play_sound("assets/audio/sfx/throw_healing_item.mp3");

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

let current_item = 2;

let mouse_x;
let mouse_y;

let update_id;

function get_mouse_pos(event) {
  mouse_x = event.clientX;
  mouse_y = event.clientY;
}

play_button.addEventListener("click", (e) => {
  document.getElementById("menu").remove();
  update_id = setInterval(update, 1000 / fps);

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
});

function update() {
  shotgun.chamber_ammo();
  if (flashlight.is_on == true) flashlight.battery_decay();

  update_scene();
  if (player.health <= 0) {
    clearInterval(update_id);

    game_over = document.createElement("div");
    game_over.id = "game_over";
    game_over.innerHTML = `<h1> Game Over! </h1> 
<p> Você perdeu dessa vez, mas ainda nâo acabou! </p>
<p id = "play_again"> Jogar de novo! </p>
`;

    document.body.insertBefore(
      game_over,
      document.body.childNodes[0].nextSibling,
    );

    document.getElementById("play_again").addEventListener("click", (e) => {
      clear_scenes();

      player.health = max_hp;
      game_over.remove();
      update_id = setInterval(update, 1000 / fps);
    });
  }
}
