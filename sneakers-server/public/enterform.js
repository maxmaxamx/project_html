document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const login = document.getElementById('mainsearch');
    const register = document.getElementById('registerForm');

    if (token && username) {
        // Hide login/register fields
        if (login) {
            login.classList.add('hidden');
        }
        if (register) {
            register.classList.add('hidden');
        }
        

        // Show logout button
        const logoutButton = document.createElement('button');
        const div = document.getElementById('out');
        logoutButton.textContent = 'Выйти';
        logoutButton.id = 'logout-button';
        logoutButton.style.marginTop = '20px';
        div.appendChild(logoutButton);

        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('cart');
            window.location.href = 'index.html'; // Redirect to the homepage
        });
    }
});
