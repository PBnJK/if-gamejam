const SCENE_FRENTE = 0;
const SCENE_LADO = 1;
const SCENE_BAIXO = 2;

const Z_MAX = 800;
const Z_MIN = 0;

const wrapper = document.getElementById("wrapper");

class Enemy {
  /*
   * z = 0.0 -> 1.0 (0 é lá longe e 1.0 é logo em cima da gente)
   */

  constructor(path, x, y, z, w, h, health) {
    this.path = path;

    this.x = 0;
    this.y = 0;
    this.z = z;
    this.r = Math.max(w, h);
    this.rect = undefined;

    this.off_x = 0;
    this.off_y = 0;

    this.health = health;

    this.element = this.createBaseElement(w, h);
    this.move_to(x, y);
  }

  createBaseElement(w, h) {
    const el = document.createElement("div");
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

    const br = wrapper.getBoundingClientRect();
    this.x = this.off_x = x + br.left;
    this.y = this.off_y = y + br.top + window.scrollY;

    this.rect = e.getBoundingClientRect();

    e.style.left = this.off_x + "px";
    e.style.top = this.off_y + "px";
  }

  change_to_idle() {
    this.change_to_state("idle");
  }

  change_to_state(state) {
    this.img_el.setAttribute("src", this.fetchAsset(state));
  }

  is_inside(x, y, r) {
    const dx = x - this.x;
    const dy = y - this.y;
    const dr = r + this.r;

    return Math.abs(dx * dx + dy * dy) < dr * dr;
  }

  fetchAsset(name) {
    return `assets/enemy/${this.path}/${name}.png`;
  }
}

let current_scene_id = 0;
const scenes = [[], [], []];

function init_scenes() {}

function add_enemy_to_scene(id, enemy) {
  scenes[id].push(enemy);
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

add_enemy_to_scene(SCENE_FRENTE, new Enemy("test", 32, 32, 0, 128, 128, 100));
swap_to_scene(SCENE_FRENTE);
