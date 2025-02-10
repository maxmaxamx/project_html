const products = [
    { id: 1, title: "Air-Force 1", price: 100, description: "Элегантные кроссовки для повседневной носки.", image: "https://images.footlocker.com/is/image/FLEU/315345397202?wid=620&hei=620&fmt=png-alpha"  },
    { id: 2, title: "Air-Jordan 11", price: 200, description: "Спортивные кроссовки для бега.", image: "https://images.footlocker.com/is/image/FLEU/316702763604?wid=620&hei=620&fmt=png-alpha" },
    { id: 3, title: "Vans", price: 150, description: "Кроссовки для скейтбординга.", image: "https://cdn.sneakerbaron.nl/uploads/2020/06/24160429/vans-sk8-hi-cap-black-vn0a3wm16bt.png" },
    { id: 4, title: "Air-Jordan", price: 300, description: "Баскетбольные кроссовки", image: "https://cdn-img.poizonapp.com/pro-img/cut-img/20231106/74d09d95ce6340a4b73c84a537395002.jpg?x-oss-process=image/format,webp/resize,w_800" },
    { id: 5, title: "New Balance", price: 130, description: "Повседневные кроссовки", image:"https://cdn-img.poizonapp.com/pro-img/cut-img/20240603/5349c0f144e142e6b4f7c71047fcfc09.jpg?x-oss-process=image/format,webp/resize,w_800"},
    { id: 6, title: "Adidas Originals", price: 250, description: "Фирменное качество", image:"https://cdn-img.poizonapp.com/pro-img/cut-img/20240718/e72e67c253a243c4a06598ff1c6c3bc2.jpg?x-oss-process=image/format,webp/resize,w_800"},
    { id: 7, title: "Puma suedede xl", price: 350, description: "Новый силуэт", image:"https://cdn-img.poizonapp.com/pro-img/cut-img/20240413/8b4af5994156473aad32150547e2980c.jpg?x-oss-process=image/format,webp/resize,w_800"},
    { id: 8, title: "Jordan 5 retro", price: 325, description: "Отличные баскетбольные кроссовки", image:"https://cdn-img.poizonapp.com/pro-img/cut-img/20240412/692eb1db69a84a13a5f15d3155933597.jpg?x-oss-process=image/format,webp/resize,w_800"},

];

let summ = 0;
localStorage.setItem('total-summ',JSON.stringify(summ));

function getSum() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let summ = 0;
    cart.forEach(product => {
        summ += product.price;
    });
    return summ;
}

const buttons = document.querySelectorAll(".view-details");

// Открытие модального окна
function show(event){
    const productCard = event.target.closest('.product-card');
    if (!productCard) return;

    const productId = productCard.dataset.id;
    const product = products.find(p => p.id == productId);

    if (!product) return;

    // Заполнение данных в модальном окне
    document.getElementById('modal-title').textContent = product.title;
    document.getElementById('modal-image').src = product.image;
    document.getElementById('modal-price').textContent = `Цена: $${product.price}`;
    document.getElementById('modal-description').textContent = product.description;

    // Показать модальное окно
    document.getElementById('modal').classList.remove('hidden');

    // Установка обработчика события для кнопки "Добавить в корзину"
    const addToCartButton = document.getElementById('add-to-cart');
    addToCartButton.onclick = () => addToCart(product.id);
}

function close(){
    document.getElementById('modal').classList.add('hidden');
}


// Добавление в корзину
function addToCart(productId) {
    if (!productId) {
        console.error("Error: No product ID found.");
        return;
    }

    const product = products.find(product => product.id == productId);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(p => p.id == productId);

    let summ = parseInt(JSON.parse(localStorage.getItem('total-summ')));

    if (existingProduct) {
        existingProduct.quantity += 1;
        existingProduct.price = existingProduct.price + product.price;
        summ += product.price;
    } else {
        product.quantity = 1;
        cart.push(product);
        summ += product.price;
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    localStorage.setItem('total-summ', JSON.stringify(summ));

    updateCartDisplay();

}


function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.querySelector('.shopping-cart');
    if (!cartContainer) return;

    cartContainer.innerHTML = '<div class="title">Shopping Bag</div>';

    if (cart.length === 0) {
        cartContainer.innerHTML += '<p>Здесь пока ничего нету</p>';
    } else {
        cart.forEach(product => {
            const item = document.createElement('div');
            item.classList.add('item');
            item.innerHTML = `
                <div class="buttons">
                    <button class="delete-btn" onclick="removeFromCart(${product.id})">&#x2715;</button>
                </div>
                <div class="image">
                    <img src="${product.image}" alt="${product.title}" />
                </div>
                <div class="description">
                    <span>${product.title}</span>
                    <span class="price"><b>${product.price} руб.</b></span>
                </div>
                <div class="quantity">
                    <button id="plus-btn" type="button" name="button" onclick="plus(${product.id})">
                        +
                    </button>
                    <span id="quantity" data-count>${product.quantity}</span>
                    <button id="minus-btn" type="button" name="button" onclick="minus(${product.id})">
                        -
                    </button>
                </div>
                
            `;

             const sum = document.getElementById("total");
             sum.innerHTML =`
                 <p id="total">Итого: ${getSum()}</p>
             `;

            cartContainer.appendChild(item);
            // cartContainer.appendChild(sum);
        });
    }

    // window.addEventListener('click', function(event) {
    //     if (event.target == document.getElementById('plus-btn')) {
    //         ${product.price} += product.price;
    //         product.quantity +=1;
    //     }
    //     if (event.target == document.getElementById('minus-btn')) {
            
    //     }
        
    
    // });
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = cart.find(p => p.id == productId);

    if (!product) {
        console.error("Error: No product found.");
        return;
    }

    let summ = parseInt(JSON.parse(localStorage.getItem('total-summ')));

    // Уменьшаем summ на цену удаляемого продукта
    summ -= product.price;

    // Фильтруем корзину, удаляя продукт с указанным productId
    cart = cart.filter(p => p.id != productId);

    // Обновляем localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('total-summ', JSON.stringify(summ));

    if (cart.length === 0) {
        const sum = document.getElementById("total");
             sum.innerHTML =`
                 <p id="total">Итого: ${getSum()}</p>
             `;
    }
    // Обновляем отображение корзины
    updateCartDisplay();
}
document.addEventListener('click', (event) => {
    if(event.target === document.getElementById("modal")){
        close();
    }
});

const closeButton = document.querySelector('.close');
if (closeButton) {
    closeButton.addEventListener('click', close);
}

buttons.forEach(btn => btn.addEventListener('click', show));

document.addEventListener('DOMContentLoaded', updateCartDisplay);

function plus(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = cart.find(product => product.id == productId);

    if (!product) {
        console.error("Error: No product found.");
        return;
    }

    product.price += (product.price)/product.quantity;
    product.quantity += 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

function minus(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = cart.find(product => product.id == productId);
    
    if (!product) {
        console.error("Error: No product found.");
        return;
    }

    if (product.quantity > 1) {
        product.price -= (product.price)/product.quantity;
        product.quantity -= 1;
    } else {
        cart = cart.filter(p => p.id != productId);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}


function showEnter() {
    let ent = document.getElementById('enter-main');
    if (ent) {
        ent.classList.remove('hidden');
    } else {
        console.error("Error: No element with class 'enterr' found.");
    }
}

document.getElementById('enter-button').addEventListener('click', showEnter);

function closeEnter() {
    const enterDiv = document.getElementById('enter-main');
    if (enterDiv) {
        enterDiv.classList.add('hidden');
    } else {
        console.error("Error: No element with id 'enter-main' found.");
    }
}

document.querySelector('.close-enter').addEventListener('click', closeEnter);
document.addEventListener('click', (event) => {
    if(event.target === document.getElementById("enter-main")){
        closeEnter();
    }
});
