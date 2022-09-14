// Elementos capturados del DOM
const cards = document.getElementById("cards")
const items = document.getElementById('items')
const footer = document.getElementById('footer')
const templatedCard = document.getElementById("template-card").content
const templateFooter = document.getElementById('template-footer').content
const templateCarrito = document.getElementById('template-carrito').content
const fragment = document.createDocumentFragment()
let carrito = {}

// Ejecutamos el fetchData de abajo
document.addEventListener('DOMContentLoaded', () => {
    fetchData()
    if(localStorage.getItem('carrito')){
        carrito = JSON.parse(localStorage.getItem('carrito'))
        pintarCarrito()
    }
})

cards.addEventListener("click", e =>{
    agregarAlCarrito(e)
})

items.addEventListener('click', e => {
    btnAccion(e)
})

// Capturamos los datos de nuestro JSON
const fetchData = async () => {
    try {
        const res = await fetch('api.json')
        const data = await res.json()
        pintarCards(data)
    }catch (error){
        console.log(error)
    }
}

// Renderizado de las Cards
const pintarCards = data => {
    data.forEach(producto=>{
        //Accedemos a cada etiqueta de la card, y lo hacemos dinámico con la data de la api
        templatedCard.querySelector('h5').textContent = producto.marca
        templatedCard.querySelector('p').textContent = producto.precio
        templatedCard.querySelector('h6').textContent = producto.caracteristicas
        templatedCard.querySelector('img').setAttribute("src", producto.imagen)
        templatedCard.querySelector('.btn-dark').dataset.id = producto.id

        // Para visualizar tenemos que clonarlo y pasarlo al fragment
        const clone = templatedCard.cloneNode(true)
        fragment.appendChild(clone)
    })
    // Lo pasamos a las cards con la información del ID del HTML donde lo vamos a renderizar: cards.
    cards.appendChild(fragment)
}

// Función agregar al carrito
const agregarAlCarrito = e => {
    // Capturamos el botón de agregar al carrito
    if (e.target.classList.contains('btn-dark')){
        // Pusheamos esa data a setCarrito
        setCarrito(e.target.parentElement)
    }
    // Usamos el stop prop. para detener cualquier otro evento que se genere en el Cards.
    e.stopPropagation()
}

// Función que manipula nuestro carro
const setCarrito = objeto => {
    // Recibe los objetos al apretar el boton Comprar
    const producto = {
        // Parámetros que trae cuando se apretamos el boton Comprar
        id: objeto.querySelector('.btn-dark').dataset.id,
        marca: objeto.querySelector('h5').textContent,
        precio: objeto.querySelector('p').textContent, 
        cantidad: 1 
    }
    // Lógica de aumentar la cantidad al apretar varias veces el btn Comprar.
    if(carrito.hasOwnProperty(producto.id)) {
        producto.cantidad = carrito[producto.id].cantidad + 1
    }
    // Pusheamos el producto al carrito
    carrito[producto.id] = {...producto}
    pintarCarrito()
}

// Renderizado del carrito igual que con las cards
const pintarCarrito = () => {
    items.innerHTML = ''
    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('th').textContent = producto.id
        templateCarrito.querySelectorAll('td')[0].textContent = producto.marca
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id
        templateCarrito.querySelector('span').textContent = producto.cantidad * producto.precio
        const clone = templateCarrito. cloneNode(true)
        fragment.appendChild(clone)
    })
    items.appendChild(fragment)

    pintarFooter()

    //Guardado de info en el localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito))
}

// Renderizado del footer del carrito
const pintarFooter = () => {
    //Si el footer del carrito no tiene ningún producto dentro lo reiniciamos
    footer.innerHTML = ''
    // Renderizamos el carrito vacío
    if(Object.keys(carrito).length === 0){
        footer.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío.</th>
        `
        return
    }

    // Lógica para la suma de productos en el footer del carrito
    const nCantidad = Object.values(carrito).reduce((acc, {cantidad}) =>acc + cantidad,0)
    // Lógica para la suma de los precios de los productos en el footer del carrito
    const nPrecio = Object.values(carrito).reduce((acc,{cantidad, precio}) => acc + cantidad * precio, 0)

    // Renderizado de los datos del footer del carrito
    templateFooter.querySelectorAll('td')[0].textContent = nCantidad
    templateFooter.querySelector('span').textContent = nPrecio
    const clone = templateFooter.cloneNode(true)
    fragment.appendChild(clone)
    footer.appendChild(fragment)  

    // Lógica para vaciar el carrito con el btn
    const btnVaciar = document.getElementById('vaciar-carrito')
    btnVaciar.addEventListener('click', () =>{
        Swal.fire({
            title: 'Seguro que quieres vaciar el carrito?',
            text: "No lo podrás revertir",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, estoy seguro!'
          }).then((result) => {
            if (result.isConfirmed) {
            carrito = {}
            pintarCarrito()
              Swal.fire(
                'Borrado!',
                'El carrito ha sido borrado',
                'success'
              )
            }
          })
    })
    
}

// Botones de aumentar y disminuir el producto
const btnAccion = e => {
    // Acción de aumentar
    if(e.target.classList.contains('btn-info')){
        const producto = carrito[e.target.dataset.id]
        producto.cantidad++
        carrito[e.target.dataset.id] = {...producto}
        pintarCarrito()
    }
    // Acción disminuir producto
    if(e.target.classList.contains('btn-danger')){
        const producto = carrito[e.target.dataset.id]
        producto.cantidad--
        if(producto.cantidad === 0){
            delete carrito[e.target.dataset.id]
        }
        pintarCarrito()
    }
    e.stopPropagation()
}
