const SCENE_FRENTE = 0;
const SCENE_LADO = 1;
const SCENE_BAIXO = 2;

const Z_MAX = 800;
const Z_MIN = 0;

const wrapper = document.getElementById("wrapper");
const darkness = document.getElementById("darkness");

let flashlight_radius = 256;

let static_enemy_id = 0;

const EnemyState = {
  IDLE: 0,
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
    console.log(z);
  }

  change_to_idle() {
    this.change_to_state("idle");
  }

  change_to_state(state) {
    this.img_el.setAttribute("src", this.fetch_asset(state));
  }

  is_inside(x, y, r) {
    const dx = x - this.off_x;
    const dy = y - this.off_y;
    const dr = r + this.r;

    return Math.abs(dx * dx + dy * dy) < dr * dr;
  }

  hit() {
    this.health--;
    if (this.health <= 0) {
      remove_enemy_from_scene(this.scene, this.id);
    }
  }

  hit_by_light() {}

  update() {}

  fetch_asset(name) {
    return `assets/enemy/${this.path}/${name}.png`;
  }
}

let current_scene_id = 0;
const scenes = [[], [], []];

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
  darkness.style.display = "block";
}

function lights_off() {
  darkness.style.display = "none";
}

function move_flashlight(x, y) {
  const br = wrapper.getBoundingClientRect();
  const px = x - br.left;
  const py = y;
  darkness.style.maskImage = `radial-gradient(circle at ${px}px ${py}px, transparent 0, white ${flashlight_radius}px)`;
}

add_enemy_to_scene(SCENE_FRENTE, new Enemy("test", 0, 0, 0, 128, 128, 3, true));
swap_to_scene(SCENE_FRENTE);

lights_on();
document.addEventListener("mousemove", (e) => {
  move_flashlight(e.clientX, e.clientY);
});
