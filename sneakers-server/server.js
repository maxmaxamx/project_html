const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '#189AsD#',
  database: 'sneakers_db'
});

db.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err);
    process.exit(1); // Выход из процесса при ошибке
  } else {
    console.log('Connected to database');
  }
});

// Обработка ошибок при запросах
db.on('error', (err) => {
  console.error('Ошибка при работе с базой данных:', err);
});

// Обслуживание статических файлов из папки public
app.use(express.static(path.join(__dirname, 'public')));

// Маршрут для index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Регистрация пользователя
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
      if (err) {
        console.error('Ошибка при регистрации:', err);
        res.status(500).json({ error: 'Error registering user' });
      } else {
        res.status(201).json({ message: 'User registered successfully' });
      }
    });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Вход пользователя
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
      if (err) {
        console.error('Ошибка при входе:', err);
        res.status(500).json({ error: 'Error logging in' });
      } else if (results.length > 0) {
        const match = await bcrypt.compare(password, results[0].password);
        if (match) {
          const userId = results[0].id;
          const token = jwt.sign({ id: userId }, 'your_secret_key', { expiresIn: '1h' });

          // Получаем корзину пользователя из базы данных
          db.query('SELECT * FROM cart WHERE user_id = ?', [userId], (cartErr, cartResults) => {
            if (cartErr) {
              console.error('Ошибка при получении корзины:', cartErr);
              res.status(500).json({ error: 'Error fetching cart' });
            } else {
              // Отправляем данные пользователя и корзину в ответе
              res.json({ token: token, cart: cartResults });
            }
          });
        } else {
          res.status(401).json({ error: 'Invalid credentials' });
        }
      } else {
        res.status(401).json({ error: 'User not found' });
      }
    });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Получение корзины пользователя
app.get('/cart', verifyToken, (req, res) => {
  try {
    const user_id = req.user.id;

    db.query('SELECT * FROM cart WHERE user_id = ?', [user_id], (err, results) => {
      if (err) {
        console.error('Ошибка при получении корзины:', err);
        res.status(500).json({ error: 'Error fetching cart' });
      } else {
        res.json(results);
      }
    });
  } catch (error) {
    console.error('Ошибка при получении корзины:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add item to cart
app.post('/cart', verifyToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity, image, price } = req.body;

    if (!product_id || !quantity || !image || !price) {
      console.error('Missing required fields:', { product_id, quantity, image, price });
      return res.status(400).json({ error: 'Product ID, quantity, image, and price are required' });
    }

    // Check if the product already exists in the user's cart
    db.query('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [userId, product_id], (err, results) => {
      if (err) {
        console.error('Error checking cart:', err);
        return res.status(500).json({ error: 'Error checking cart' });
      }

      if (results.length > 0) {
        // Update quantity if the product already exists
        const newQuantity = results[0].quantity + quantity;
        db.query('UPDATE cart SET quantity = ?, image = ?, price = ? WHERE user_id = ? AND product_id = ?', 
          [newQuantity, image, price, userId, product_id], (updateErr) => {
          if (updateErr) {
            console.error('Error updating cart:', updateErr);
            return res.status(500).json({ error: 'Error updating cart' });
          }
          console.log('Cart updated successfully:', { userId, product_id, newQuantity, image, price });
          res.status(200).json({ message: 'Cart updated successfully' });
        });
      } else {
        // Insert new product into the cart
        db.query('INSERT INTO cart (user_id, product_id, quantity, image, price) VALUES (?, ?, ?, ?, ?)', 
          [userId, product_id, quantity, image, price], (insertErr) => {
          if (insertErr) {
            console.error('Error adding to cart:', insertErr);
            return res.status(500).json({ error: 'Error adding to cart' });
          }
          console.log('Product added to cart successfully:', { userId, product_id, quantity, image, price });
          res.status(201).json({ message: 'Product added to cart successfully' });
        });
      }
    });
  } catch (error) {
    console.error('Unexpected error in /cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Синхронизация корзины с базы данных
app.post('/sync-cart', verifyToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { cart } = req.body;

    if (!Array.isArray(cart)) {
      console.error('Invalid cart format:', cart);
      return res.status(400).json({ error: 'Invalid cart format' });
    }

    db.query('DELETE FROM cart WHERE user_id = ?', [userId], (deleteErr) => {
      if (deleteErr) {
        console.error('Error deleting old cart:', deleteErr);
        return res.status(500).json({ error: 'Error syncing cart' });
      }

      if (cart.length === 0) {
        return res.status(200).json({ message: 'Cart synced successfully' });
      }

      const cartItems = cart.map(item => [userId, item.id, item.quantity, item.image, item.price]);
      db.query('INSERT INTO cart (user_id, product_id, quantity, image, price) VALUES ?', [cartItems], (insertErr) => {
        if (insertErr) {
          console.error('Error inserting new cart:', insertErr);
          return res.status(500).json({ error: 'Error syncing cart' });
        }

        res.status(200).json({ message: 'Cart synced successfully' });
      });
    });
  } catch (error) {
    console.error('Unexpected error in /sync-cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

function verifyToken(req, res, next) {
  try {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, 'your_secret_key', (err, decoded) => {
      if (err) return res.status(401).json({ error: 'Unauthorized' });
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Ошибка при верификации токена:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Обработчик 404
app.use((req, res) => {
  res.status(404).json({ error: 'Resource not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
