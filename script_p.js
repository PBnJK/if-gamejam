const SCENE_FRENTE = 0;
const SCENE_LADO = 1;
const SCENE_BAIXO = 2;

const Z_MAX = 4.0;

const DT_FRAME = 1000 / fps;
const DEATH_TIME = 12 * DT_FRAME;
const DEATH_TICKS = DT_FRAME / DEATH_TIME;

const wrapper = document.getElementById("wrapper");
const darkness = document.getElementById("darkness");
const pov = document.getElementById("pov");

let static_enemy_id = 0;

const EnemyState = {
  IDLE: 0,
  DEAD: 9,
};

class Enemy {
  /*
   * z = 0.0 -> 1.0 (0 é lá longe e 1.0 é logo em cima da gente)
   */

  constructor(path, x, y, z, w, h, health, photosensitive) {
    this.path = path;

    this.id = static_enemy_id;
    static_enemy_id++;

    this.x = 0;
    this.y = 0;
    this.z = z;
    this.r = Math.max(w, h);
    this.rect = undefined;

    this.off_x = 0;
    this.off_y = 0;
    this.seen = false;

    this.health = health;
    this.photosensitive = photosensitive;

    this.state = this.element = this.create_base_element(w, h);
    this.move_to(x, y);
  }

  create_base_element(w, h) {
    const el = document.createElement("div");
    el.id = `enemy-${this.id}`;
    el.classList.add("enemy");

    this.img_el = document.createElement("img");
    if (w) {
      this.img_el.setAttribute("width", w);
    }

    if (h) {
      this.img_el.setAttribute("height", h);
    }

    this.change_to_idle();

    el.appendChild(this.img_el);

    return el;
  }

  move_to(x, y) {
    const e = this.element;

    this.x = x;
    this.y = y;

    const br = wrapper.getBoundingClientRect();
    this.off_x = x + br.left;
    this.off_y = y + br.top + window.scrollY;

    this.rect = e.getBoundingClientRect();
    e.style.left = this.x + "px";
    e.style.top = this.y + "px";
  }

  move_forward(z) {
    this.z += z;
    if (this.z > Z_MAX) {
      this.z = Z_MAX;
    }

    this.element.style.transform = `scale(${this.z})`;
  }

  change_to_state(state) {
    switch (state) {
      case EnemyState.IDLE:
        this.change_to_idle();
        break;
      case EnemyState.DEAD:
        this.change_to_dead();
        break;
    }

    this.state = state;
  }

  change_to_idle() {
    this.frame("idle");
  }

  change_to_dead() {
    this.frame("dead");

    this.death_counter = DEATH_TIME;
    this.death_opacity = 0.0;
  }

  is_inside(x, y, r) {
    const dx = x - this.off_x;
    const dy = y - this.off_y;
    const dr = r + this.r;

    return Math.abs(dx * dx + dy * dy) < dr * dr;
  }

  hit(damage = 1) {
    this.health -= damage;
    if (this.health <= 0) {
      this.change_to_state(EnemyState.DEAD);
    }
  }

  hit_by_light() {}

  update() {
    switch (this.state) {
      case EnemyState.IDLE:
        this.update_idle();
        break;
      case EnemyState.DEAD:
        this.update_dead();
        break;
    }
  }

  update_idle() {}

  update_dead() {
    this.death_counter -= DT_FRAME;
    if (this.death_counter < 0) {
      remove_enemy_from_scene(this.scene, this.id);
      return;
    }

    this.death_opacity += DEATH_TICKS;
    this.element.style.opacity = this.death_opacity;
  }

  frame(to) {
    this.img_el.setAttribute("src", this.fetch_asset(to));
  }

  fetch_asset(name) {
    return `assets/enemy/${this.path}/${name}.png`;
  }
}

let current_scene_id = 0;
const scenes = [[], [], []];

function lerp(x, y, t) {
  return (1 - t) * x + t * y;
}

function init_scenes() {}

function add_enemy_to_current_scene(enemy) {
  add_enemy_to_scene(current_scene_id, enemy);
}

function add_enemy_to_scene(id, enemy) {
  scenes[id].push(enemy);
  enemy.scene = id;
}

function remove_enemy_from_current_scene(enemy) {
  remove_enemy_from_scene(current_scene_id, enemy);
}

function remove_enemy_from_scene(id, enemy) {
  const s = scenes[id];

  const idx = s.findIndex((v) => {
    return v.id === enemy;
  });
  if (idx === -1) {
    return;
  }

  const e = s[idx];
  e.element.remove();

  scenes[id].splice(idx, 1);
  delete e;
}

function swap_to_left_scene() {
  let id = current_scene_id - 1;
  if (id < 0) {
    id = 2;
  }

  swap_to_scene(id);
}

function swap_to_right_scene() {
  const id = (current_scene_id + 1) % 3;
  swap_to_scene(id);
}

function swap_to_scene(id) {
  while (wrapper.lastChild) {
    wrapper.removeChild(wrapper.lastChild);
  }

  const scene = scenes[id];
  for (const e of scene) {
    wrapper.appendChild(e.element);
    e.change_to_idle();
  }

  current_scene_id = id;
}

function get_current_scene() {
  return scenes[current_scene_id];
}

function shoot(x, y, r) {
  const hit = [];

  const s = get_current_scene();
  for (const e of s) {
    if (e.is_inside(x, y, r)) {
      hit.push(e);
    }
  }

  return hit;
}

function shine(x, y, r) {
  const hit = [];

  const s = get_current_scene();
  for (const e of s) {
    if (e.photosensitive && e.is_inside(x, y, r)) {
      hit.push(e);
    }
  }

  return hit;
}

function update_scene() {
  for (const e of get_current_scene()) {
    e.update();
  }
}

function lights_on() {
  pov.setAttribute("src", "assets/player/flashlight/on.png");
  move_flashlight(mouse_x, mouse_y);
  turn_lights_on();
}

function turn_lights_on() {
  wrapper.style.opacity = 1.0;
  pov.style.opacity = 1.0;
}

function light_off() {
  pov.setAttribute("src", "assets/player/flashlight/off.png");
  turn_light_off();
}

function turn_light_off() {
  darkness.style.maskImage = "";
  wrapper.style.opacity = 0.1;
  pov.style.opacity = 0.25;
}

function swap_weapon(curr_id) {
  switch (curr_id) {
    case 0 /* Shotgun */:
      pov.setAttribute("src", "assets/player/shotgun/idle.png");
      break;
    case 1 /* Heal */:
      pov.setAttribute("src", "assets/player/shotgun/idle.png");
      break;
    case 2 /* Flashlight */:
      pov.setAttribute("src", "assets/player/flashlight/off.png");
      break;
  }
}

function move_flashlight(x, y) {
  const br = wrapper.getBoundingClientRect();
  const px = x - br.left;
  const py = y;
  darkness.style.maskImage = `radial-gradient(circle at ${px}px ${py}px, transparent 0, #000000D0 ${flashlight_radius}px, #000000B0 ${flashlight_radius * 2}px)`;
}

let muzzle_flash_id = -1;
function muzzle_flash() {
  if (muzzle_flash_id !== -1) {
    window.clearTimeout(muzzle_flash_id);
  }

  turn_lights_on();
  muzzle_flash_id = window.setTimeout(() => {
    muzzle_flash_id = -1;
    turn_light_off();
  }, 150);
}

function play_sound(src) {
  const audio = new Audio(src);
  audio.play().catch((e) => {
    console.log("Error playing audio: ", e);
  });
}

add_enemy_to_scene(
  SCENE_FRENTE,
  new Enemy("eyeless", 0, 300, 1, 200, 500, 2, true),
);
swap_to_scene(SCENE_FRENTE);

light_off();
