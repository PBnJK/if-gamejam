// current_item = item selecionado
// invetory = todos os itens

let current_item = null;

let a = "Arma"
let b = "Lanterna"
let c = "Poder"


let invetory = [a, b, c]



document.addEventListener("keydown", function (teclado) {
    const numero = Number(teclado.key)

    if (numero >= 1 && numero <= player.invetory.length) {
        current_item = player.invetory[numero - 1]
        console.log(`Selecionado: ${current_item}`)
    } else { }
})