// current_item = item selecionado
// invetory = todos os itens

document.addEventListener("keydown", function (teclado) {
  const numero = Number(teclado.key);

  if (numero >= 1 && numero <= player.inventory.length) {
    current_item = numero - 1;
    console.log(`Selecionado: ${current_item}`);
  } else {
  }
});

