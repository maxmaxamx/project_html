const products = [
    { id: 1, title: "Air-Force 1", price: 100, description: "Элегантные кроссовки для повседневной носки.", image: "https://images.footlocker.com/is/image/FLEU/315345397202?wid=620&hei=620&fmt=png-alpha"  },
    { id: 2, title: "Air-Jordan 11", price: 200, description: "Спортивные кроссовки для бега.", image: "https://images.footlocker.com/is/image/FLEU/316702763604?wid=620&hei=620&fmt=png-alpha" },
    { id: 3, title: "Vans", price: 150, description: "Кроссовки для скейтбординга.", image: "https://cdn.sneakerbaron.nl/uploads/2020/06/24160429/vans-sk8-hi-cap-black-vn0a3wm16bt.png" },
    { id: 4, title: "Air-Jordan", price: 300, description: "Баскетбольные кроссовки", image: "https://cdn-img.poizonapp.com/pro-img/cut-img/20231106/74d09d95ce6340a4b73c84a537395002.jpg?x-oss-process=image/format,webp/resize,w_800" },
    { id: 5, title: "New Balance", price: 130, description: "Повседневные кроссовки", image:"https://cdn-img.poizonapp.com/pro-img/cut-img/20240603/5349c0f144e142e6b4f7c71047fcfc09.jpg?x-oss-process=image/format,webp/resize,w_800"},
    { id: 6, title: "Adidas Originals", price: 250, description: "Фирменное качество", image:"https://cdn-img.poizonapp.com/pro-img/cut-img/20240718/e72e67c253a243c4a06598ff1c6c3bc2.jpg?x-oss-process=image/format,webp/resize,w_800"},
    { id: 7, title: "Puma suede xl", price: 350, description: "Новый силуэт", image:"https://cdn-img.poizonapp.com/pro-img/cut-img/20240413/8b4af5994156473aad32150547e2980c.jpg?x-oss-process=image/format,webp/resize,w_800"},
    { id: 8, title: "Jordan 5 retro", price: 325, description: "Отличные баскетбольные кроссовки", image:"https://cdn-img.poizonapp.com/pro-img/cut-img/20240412/692eb1db69a84a13a5f15d3155933597.jpg?x-oss-process=image/format,webp/resize,w_800"},

];

let summ = 0;
localStorage.setItem('total-summ',JSON.stringify(summ));

function getSum() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let summ = 0;
    cart.forEach(product => {
        summ += product.quantity * product.price; // Calculate total price dynamically
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

    addToCartServer(productId, 1); // Sync with the server

    const product = products.find(product => product.id == productId);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(p => p.id == productId);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        // Add new product with all required fields
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price, // Keep the original price
            image: product.image,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('total-summ', JSON.stringify(getSum())); // Update total price

    updateCartDisplay();
    syncCartWithServer(); // Sync cart after updating
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
                    <span class="price"><b>${product.quantity * product.price} руб.</b></span>
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
            cartContainer.appendChild(item);
        });

        // Update the total price
        const totalElement = document.getElementById("total");
        if (totalElement) {
            totalElement.innerHTML = `<p id="total">Итого: ${getSum()} руб.</p>`;
        }
    }
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = cart.find(p => p.id == productId);

    if (!product) {
        console.error("Error: No product found.");
        return;
    }

    // Фильтруем корзину, удаляя продукт с указанным productId
    cart = cart.filter(p => p.id != productId);

    // Обновляем localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('total-summ', JSON.stringify(getSum())); // Update total price

    if (cart.length === 0) {
        const sum = document.getElementById("total");
             sum.innerHTML =`
                 <p id="total">Итого: ${getSum()}</p>
             `;
    }
    // Обновляем отображение корзины
    updateCartDisplay();
    syncCartWithServer(); // Sync cart after updating
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

document.addEventListener('DOMContentLoaded', () => {
    loadCartFromServer();
    updateCartDisplay();
    updateUserUI(); // Update the UI based on login status
});

function plus(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = cart.find(product => product.id == productId);

    if (!product) {
        console.error("Error: No product found.");
        return;
    }

    product.quantity += 1; // Increment quantity
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('total-summ', JSON.stringify(getSum())); // Update total price
    updateCartDisplay();
    syncCartWithServer(); // Sync cart after updating
}

function minus(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = cart.find(product => product.id == productId);
    
    if (!product) {
        console.error("Error: No product found.");
        return;
    }

    if (product.quantity > 1) {
        product.quantity -= 1; // Decrement quantity
    } else {
        cart = cart.filter(p => p.id != productId); // Remove product if quantity is 0
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('total-summ', JSON.stringify(getSum())); // Update total price

    // Если корзина пуста, обновляем отображение суммы
    const totalElement = document.getElementById("total");
    if (cart.length === 0 && totalElement) {
        totalElement.innerHTML = `<p id="total">Итого: 0 руб.</p>`;
    }

    updateCartDisplay();
    syncCartWithServer(); // Sync cart after updating
}


function showEnter() {
    let ent = document.getElementById('enter-main');
    if (ent) {
        ent.classList.remove('hidden');
    } else {
        console.error("Error: No element with class 'enterr' found.");
    }
}



function closeEnter() {
    const enterDiv = document.getElementById('enter-main');
    if (enterDiv) {
        enterDiv.classList.add('hidden');
    } else {
        console.error("Error: No element with id 'enter-main' found.");
    }
}


document.addEventListener('click', (event) => {
    if(event.target === document.getElementById("enter-main")){
        closeEnter();
    }
});


// Код из предоставленного файла project.js остается без изменений
// Добавьте следующие функции для работы с сервером

async function register(username, password) {
    const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        throw new Error(`Failed to register: ${response.status}`);
    }

    return response.json();
}

async function login(username, password) {
    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error(`Failed to login: ${response.status}`);
        }

        const data = await response.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', username); // Store the username
            localStorage.setItem('cart', JSON.stringify(data.cart || []));
            updateCartDisplay();
            updateUserUI(); // Update the UI after login
            window.location.href = 'index.html';
        } else {
            alert('Ошибка входа: ' + data.error);
        }
    } catch (error) {
        console.error('Ошибка при входе:', error);
        alert('Ошибка входа: ' + error.message);
    }
}

function loadCart(){
    getCartFromServer()
}
  
async function addToCartServer(productId, quantity) {
    const token = localStorage.getItem('token');
    const product = products.find(p => p.id === productId); // Find product details
    if (!product) {
        console.error('Product not found for ID:', productId);
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({
                product_id: productId,
                quantity,
                image: product.image,
                price: product.price
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error(`Failed to add to cart: ${response.status}`);
        }

        // Removed console.log for successful addition
    } catch (error) {
        console.error('Error adding to cart on server:', error);
    }
}
  
async function getCartFromServer() {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/cart', {
      headers: { 'Authorization': token }
    });
    return response.json();
}
  
async function syncCartWithServer() {
    const token = localStorage.getItem('token');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    try {
        const response = await fetch('http://localhost:3000/sync-cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ cart })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error(`Failed to sync cart: ${response.status}`);
        }
    } catch (error) {
        console.error('Error syncing cart with server:', error);
    }
}

async function loadCartFromServer() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:3000/cart', {
            headers: { 'Authorization': token }
        });

        if (!response.ok) {
            throw new Error(`Failed to load cart: ${response.status}`);
        }

        const cart = await response.json();
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    } catch (error) {
        console.error('Error loading cart from server:', error);
    }
}
  
function updateUserUI() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const enterButton = document.getElementById('enter-button'); // Button in the header

    if (token && username) {
        // Replace "Войти" button with the username
        enterButton.textContent = username;
        enterButton.onclick = () => showUserMenu(); // Show user menu on click
    } else {
        // Reset to "Войти" button
        enterButton.textContent = 'Войти';
        enterButton.onclick = () => {
            window.localStorage.setItem("theme", 'enter-button');
            window.location.href = 'enterform.html';
        };
    }
}

function showUserMenu() {
    const userMenu = document.getElementById('user-menu');
    userMenu.innerHTML = `
        <button id="logout-button">Выйти</button>
    `;
    document.getElementById('logout-button').addEventListener('click', logout);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('cart');
    updateUserUI();
    updateCartDisplay();
    window.location.href = 'index.html'; // Redirect to the homepage
}

const kin = document.getElementById('enter-button');
kin.addEventListener('click', function(event) {  
    window.localStorage.setItem("theme",'enter-button')
    window.location.href = 'enterform.html';
});

function displayProducts(productsArray) {
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = ''; // Очищаем контейнер

    productsArray.forEach(product => {
        const button = document.createElement('button');
        button.classList.add('view-details');
        
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.dataset.id = product.id;

        const productImage = document.createElement('img');
        productImage.src = product.image;
        productImage.alt = product.title;
        productImage.classList.add('img-small');

        const productTitle = document.createElement('h3');
        productTitle.textContent = product.title;

        const productPrice = document.createElement('p');
        productPrice.textContent = `Цена: $${product.price}`;

        const productDescription = document.createElement('p');
        productDescription.textContent = product.description;
        productDescription.classList.add('hidden');

        const mod = document.createElement('div');
        mod.innerHTML = `<div id="modal" class="modal hidden">
        <div class="modal-content"> 
            <button class="close">&#x2715;</button>
            <h2 id="modal-title">Название товара</h2>
            <img id="modal-image" src="" alt="Изображение товара">
            <p><b id="modal-price">Цена: $0</b></p>
            <p id="modal-description">Описание товара...</p>    
            <button id="add-to-cart" data-cart onclick="addToCart(event)">Добавить в корзину</button>
        </div>
    </div>`

        productCard.appendChild(button);
        button.appendChild(productImage);
        productCard.appendChild(productTitle);
        productCard.appendChild(productPrice);
        productCard.appendChild(productDescription);
        productCard.appendChild(mod);

        productsContainer.appendChild(productCard);
        button.addEventListener('click', show);
        
    });
}

function sortByPriceAscending() {
    products.sort((a, b) => a.price - b.price);
    displayProducts(products);
}

function sortByPriceDescending() {
    products.sort((a, b) => b.price - a.price);
    displayProducts(products);
}

// Изначальное отображение товаров
displayProducts(products);
