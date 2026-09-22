/*

  <:3)~
   ^
   |
Horácio

*/

const fps = 24;

class Player {

    health;

    constructor(){

        health = 2;
    }

}

class Flashlight {

    battery;
    constructor(){
        this.battery = 60 * fps;

    }

    battery_decay(){

        battery --;

    }
}


class Item{
    constructor(x_pos, y_pos){
    this.x_pos = x_pos;
    this.y_pos = y_pos;

    }

    use_primary(){


    }

    use_secondary(){


    }
}

class Shotgun extends Item {

    ammo;

    constructor(){

        ammo = 6;
        super();
    }


    use_primary(){

        enemies_hit = shoot();

        for(const i of enemies_hit){
            i.health--;
        }
        
        ammo--;

    }

    use_secondary(){


        if (this.ammo <= 6) {
            
            ammo++
        }
    }

}

class Heal extends Item{

    


    constructor(hp){
        this.hp = hp;
        this.quantity = 1;
        super();
    }

    use_primary(player){

        player.health ++;

    }

    use_secondary(){


        if (this.ammo <= 6) {
            
            ammo++

        }
    }

}

let player = new Player();
let shotgun = new Shotgun();
let heal = new Heal();
let flashlight = new Flashlight();

player.inventory.push(shotgun);
player.inventory.push(heal);

let current_item;


let mouse_x;
let mouse_y;

function get_mouse_pos(event){


mouse_x = event.clientX;
mouse_y = event.clientY;

}



document.addEventListener("click", () => {
    get_mouse_pos();
    player.inventory[current_item].use_primary();

});

div.addEventListener("contextmenu", (e) => {e.preventDefault()

    get_mouse_pos();
    player.inventory[current_item].use_secondary();
    return false;
});



document.addEventListener("keydown", (event) => {
    if (event.key == "q") {
        swap_to_left_scene();
    }
    else if (event.key == "e"){
        swap_to_right_scene();
    }
})

function update(){



    flashlight.battery_decay();

}



setTimeout( update ,1000/fps)


