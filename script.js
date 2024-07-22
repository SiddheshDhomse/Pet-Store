// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB5ZbDhW6CS0FtTO9uKCHBKLd7T2Ukqrco",
    authDomain: "pets-store-app-baa92.firebaseapp.com",
    databaseURL: "https://pets-store-app-baa92-default-rtdb.firebaseio.com",
    projectId: "pets-store-app-baa92",
    storageBucket: "pets-store-app-baa92.appspot.com",
    messagingSenderId: "1000026829094",
    appId: "1:1000026829094:web:04dcb2f1bdc46fdeb111e7",
    measurementId: "G-VJ4BJ8TQBB"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let totalAmount = 0;
let discountAmount = 0;

// Handle barcode input
function handleBarcodeInput(event) {
    if (event.key === 'Enter') {
        const barcode = document.getElementById('barcodeInput').value;
        addProductToBill(barcode);
        document.getElementById('barcodeInput').value = ''; // Clear barcode input field
    }
}

// Handle discount input
document.getElementById('discountInput').addEventListener('change', function() {
    discountAmount = parseFloat(this.value) || 0;
    updateTotals();
});

function addProductToBill(barcode) {
    database.ref('products').orderByChild('barcode').equalTo(barcode).once('value', snapshot => {
        if (snapshot.exists()) {
            snapshot.forEach(childSnapshot => {
                const product = childSnapshot.val();
                const tableBody = document.querySelector('#billTable tbody');
                let row = Array.from(tableBody.getElementsByTagName('tr')).find(row => row.cells[0].textContent === barcode);

                if (row) {
                    // Update existing row
                    let quantityCell = row.cells[2];
                    let priceCell = row.cells[3];
                    let quantity = parseInt(quantityCell.textContent) + 1;
                    let totalPrice = parseFloat(priceCell.textContent) + product.price;

                    quantityCell.textContent = quantity;
                    priceCell.textContent = totalPrice.toFixed(2);
                } else {
                    // Add new row
                    row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${product.barcode}</td>
                        <td>${product.name}</td>
                        <td>1</td>
                        <td>${product.price.toFixed(2)}</td>
                        <td><button type="button" onclick="removeProduct(this)">Remove</button></td>
                    `;
                    tableBody.appendChild(row);
                }

                updateTotals();
            });
        } else {
            console.error('No such product!');
        }
    }).catch((error) => {
        console.error('Error getting product:', error);
    });
}

function removeProduct(button) {
    const row = button.closest('tr');
    const price = parseFloat(row.cells[3].textContent);
    const quantity = parseInt(row.cells[2].textContent);
    totalAmount -= price * quantity;
    row.remove();
    updateTotals();
}

function updateTotals() {
    // Calculate total amount without discount
    totalAmount = Array.from(document.querySelectorAll('#billTable tbody tr')).reduce((sum, row) => {
        return sum + parseFloat(row.cells[3].textContent);
    }, 0);

    // Calculate discount on total amount
    const discountValue = (discountAmount / 100) * totalAmount;
    const finalAmount = totalAmount - discountValue;

    // Update HTML elements
    document.getElementById('totalAmount').textContent = `$${totalAmount.toFixed(2)}`;
    document.getElementById('discountAmount').textContent = `$${discountValue.toFixed(2)}`;
    document.getElementById('finalAmount').textContent = `$${finalAmount.toFixed(2)}`;
}

function proceedToCheckout() {
    // Save cart details to localStorage before proceeding to checkout
    const cartItems = Array.from(document.querySelectorAll('#billTable tbody tr')).map(row => {
        return {
            barcode: row.cells[0].textContent,
            name: row.cells[1].textContent,
            quantity: parseInt(row.cells[2].textContent),
            price: parseFloat(row.cells[3].textContent)
        };
    });

    localStorage.setItem('customerName', document.getElementById('customerName').value);
    localStorage.setItem('customerEmail', document.getElementById('customerEmail').value);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    localStorage.setItem('discount', discountAmount);

    // Redirect to checkout page
    window.location.href = 'checkout.html';
}
