const SCENE_FRENTE = 0;
const SCENE_BAIXO = 1;
const SCENE_LADO = 2;

class Enemy {
  constructor(asset_path) {
    this.asset_path = asset_path;

    this.element = this.createBaseElement();
  }

  createBaseElement() {
    const el = document.createElement("div");
    el.classList.add("enemy");

    this.img_el = document.createElement("img");
    this.changeToIdle();

    el.appendChild(this.img_el);

    return el;
  }

  changeToIdle() {
    this.changeToState("idle");
  }

  changeToState(state) {
    this.img_el.setAttribute("src", this.fetchAsset(state));
  }

  fetchAsset(name) {
    const s = `assets/enemy/${this.asset_path}/${name}.png`;
    console.log(s);
    return s;
  }
}

const scenes = [[], [], []];

function init_scenes() {}

function add_enemy_to_scene(id, enemy) {
  scenes[id].push(enemy);
}

function swap_to_scene(id) {
  const wrapper = document.getElementById("wrapper");
  while (wrapper.lastChild) {
    wrapper.removeChild(wrapper.lastChild);
  }

  const scene = scenes[id];
  for (const e of scene) {
    wrapper.appendChild(e.element);
    e.changeToIdle();
  }
}

add_enemy_to_scene(SCENE_FRENTE, new Enemy("test"));
swap_to_scene(SCENE_FRENTE);
