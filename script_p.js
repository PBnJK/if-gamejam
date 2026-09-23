const SCENE_FRENTE = 0;
const SCENE_LADO = 1;
const SCENE_BAIXO = 2;

const Z_MAX = 2.0;

const DT_FRAME = 1000 / fps;
const DEATH_TIME = 12 * DT_FRAME;
const DEATH_TICKS = DT_FRAME / DEATH_TIME;

const wrapper = document.getElementById("wrapper");
const darkness = document.getElementById("darkness");
const pov = document.getElementById("pov");

let static_enemy_id = 0;

const EnemyState = {
  IDLE: 0,
  ADVANCE: 1,
  ATTACK: 2,
  COOLDOWN: 3,
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

    this.decision_start = DT_FRAME * fps;
    this.walkies_start = (DT_FRAME * fps) / 2;
    this.attack_counter_start = (DT_FRAME * fps) / 4;
    this.cooldown_start = DT_FRAME * fps;
    this.counter = 0;

    this.off_x = 0;
    this.off_y = 0;
    this.seen = false;

    this.health = health;
    this.photosensitive = photosensitive;

    this.state = EnemyState.IDLE;
    this.element = this.create_base_element(w, h);
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

    if (this.z > this.z_goal) {
      this.z = this.z_goal;
    }

    this.element.style.transform = `scale(${this.z})`;
  }

  change_to_state(state) {
    switch (state) {
      case EnemyState.IDLE:
        this.change_to_idle();
        break;
      case EnemyState.ADVANCE:
        this.change_to_advance();
        break;
      case EnemyState.ATTACK:
        this.change_to_attack();
        break;
      case EnemyState.COOLDOWN:
        this.change_to_cooldown();
        break;
      case EnemyState.DEAD:
        this.change_to_dead();
        break;
    }

    this.state = state;
  }

  change_to_idle() {
    this.frame("idle");

    this.counter = this.decision_start;
  }

  change_to_advance() {
    this.z_goal = this.z + 0.25;
    this.counter = this.walkies_start;
  }
  change_to_attack() {
    this.frame("dead");

    this.counter = this.attack_counter_start;
  }

  change_to_cooldown() {
    this.frame("idle");

    this.counter = this.cooldown_start;
  }

  change_to_dead() {
    this.frame("dead");

    this.counter = DEATH_TIME;
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

  hit_by_light() {
    this.health -= damage;
    if (this.health <= 0) {
      this.change_to_state(EnemyState.DEAD);
    }
  }

  update() {
    switch (this.state) {
      case EnemyState.IDLE:
        this.update_idle();
        break;
      case EnemyState.ADVANCE:
        this.update_advance();
        break;
      case EnemyState.ATTACK:
        this.update_attack();
        break;
      case EnemyState.COOLDOWN:
        this.update_cooldown();
        break;
      case EnemyState.DEAD:
        this.update_dead();
        break;
    }
  }

  update_idle() {
    this.counter -= DT_FRAME;
    if (this.counter < 0) {
      const advance = randf() < 0.4;
      if (advance) {
        this.change_to_state(EnemyState.ADVANCE);
      } else {
        this.counter = this.decision_start;
      }
    }
  }

  update_advance() {
    this.counter -= DT_FRAME;
    if (this.counter < 0) {
      this.move_forward(0.025);
      if (this.z >= this.z_goal - 0.001) {
        if (this.z >= Z_MAX - 0.001) {
          this.change_to_state(EnemyState.ATTACK);
        } else {
          this.change_to_state(EnemyState.IDLE);
        }
      } else {
        this.counter = this.walkies_start;
      }
    }
  }

  update_attack() {
    this.counter -= DT_FRAME;
    if (this.counter < 0) {
      player.hit();
      this.change_to_state(EnemyState.COOLDOWN);
    }
  }

  update_cooldown() {
    this.counter -= DT_FRAME;
    if (this.cooldown_counter < 0) {
      this.change_to_state(EnemyState.ATTACK);
    }
  }

  update_dead() {
    this.counter -= DT_FRAME;
    if (this.counter < 0) {
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

class Eyeless extends Enemy {
  constructor(x) {
    super("eyeless", x, 200, 1, 200, 500, 3, false);
  }
}

class Spread extends Enemy {
  constructor(x) {
    super("spread", x, 200, 1, 200, 500, 5, true);
  }

  update_advance() {
    this.counter -= DT_FRAME;
    if (this.counter < 0) {
      this.move_forward(0.025);
      if (this.z >= this.z_goal - 0.001) {
        if (this.z >= Z_MAX - 0.001) {
          if (this.scene === SCENE_FRENTE) {
            spawn_spread(SCENE_LADO);
            remove_enemy_from_scene(this.scene, this.id);
          } else {
            spawn_slime();
            remove_enemy_from_scene(this.scene, this.id);
          }
        } else {
          this.change_to_state(EnemyState.IDLE);
        }
      } else {
        this.counter = this.walkies_start;
      }
    }
  }
}

class Stalker extends Enemy {
  constructor(x) {
    super("stalker", x, 200, 1, 200, 500, 10, false);
  }
}

class Slime extends Enemy {
  constructor(x) {
    super("slime", x, 200, 1, 800, 600, 3, true);
    this.change_to_state(EnemyState.ATTACK);
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

const BG_IMG = [
  "url(ASSETS/Cenarios/Cenario1Montado.png)",
  "url(ASSETS/Cenarios/Cenario2.png)",
  "url(ASSETS/Cenarios/Cenario3.png)",
];

function swap_to_scene(id) {
  while (wrapper.lastChild) {
    wrapper.removeChild(wrapper.lastChild);
  }

  const scene = scenes[id];
  for (const e of scene) {
    wrapper.appendChild(e.element);
    e.change_to_idle();
  }

  wrapper.style.backgroundImage = BG_IMG[id];

  current_scene_id = id;
}

function clear_scenes() {
  for (let i = 0; i < scenes.length; ++i) {
    for (let j = 0; j < scenes[i].length; ++j) {
      const e = scenes[i][j];
      e.element.remove();
      delete e;
    }
    scenes[i].length = 0;
  }
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
  for (const s of scenes) {
    for (const e of s) {
      e.update();
    }
  }
}

function lights_on() {
  pov.setAttribute("src", "assets/player/flashlight/on.png");
  move_flashlight(mouse_x, mouse_y);
  turn_lights_on();
}

function turn_lights_on() {
  wrapper.style.opacity = 1.0;
  pov.style.filter = "";
}

function light_off() {
  pov.setAttribute("src", "assets/player/flashlight/off.png");
  turn_light_off();
}

function turn_light_off() {
  darkness.style.maskImage = "";
  wrapper.style.opacity = 0.1;
  pov.style.filter = "brightness(0.2)";
}

function swap_weapon(curr_id) {
  light_off();
  switch (curr_id) {
    case 0 /* Shotgun */:
      pov.setAttribute("src", "assets/player/shotgun/idle.png");
      break;
    case 1 /* Heal */:
      pov.setAttribute("src", "assets/player/heal/idle.png");
      break;
    case 2 /* Flashlight */:
      pov.setAttribute("src", "assets/player/flashlight/off.png");
      break;
  }
}

function spawn_enemy() {
  const enemy_type = randf();
  if (enemy_type < 0.6) {
    spawn_eyeless(randi(0, 1));
  } else if (enemy_type < 0.8) {
    spawn_spread(randi(0, 1));
  } else {
    spawn_stalker();
  }

  setTimeout(spawn_enemy, 1000 * randi(5, 15));
}

function spawn_eyeless(scene_id) {
  const x = randf() * 500.0 + 100.0;

  const eyeless = new Eyeless(x);
  add_enemy_to_scene(scene_id, eyeless);
}

function spawn_spread(scene_id) {
  const x = randf() * 500.0 + 100.0;
  const spread = new Spread(x);
  add_enemy_to_scene(scene_id, spread);
}

function spawn_stalker() {
  const x = randf() * 500.0 + 100.0;
  const stalker = new Stalker(x);
  add_enemy_to_scene(SCENE_FRENTE, stalker);
}

function spawn_slime() {
  const x = randf() * 500.0 + 100.0;
  const slime = new Slime(x);
  add_enemy_to_scene(SCENE_BAIXO, slime);
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

const randf = Math.random;

function randi(start, end) {
  const n = randf();
  if (typeof end === "undefined") {
    end = start;
    start = 0;
  }

  return Math.round(start + (end - start) * n);
}

spawn_enemy();

swap_to_scene(SCENE_FRENTE);

turn_light_off();
