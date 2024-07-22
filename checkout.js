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
const db = firebase.database();

// Function to populate checkout page
function populateCheckout() {
    const customerName = localStorage.getItem('customerName');
    const customerEmail = localStorage.getItem('customerEmail');
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

    document.getElementById('customerName').value = customerName || '';
    document.getElementById('customerEmail').value = customerEmail || '';

    const checkoutTable = document.getElementById('checkoutTable').getElementsByTagName('tbody')[0];
    checkoutTable.innerHTML = ''; // Clear existing rows

    cartItems.forEach(item => {
        const row = checkoutTable.insertRow();
        row.insertCell(0).textContent = item.barcode;
        row.insertCell(1).textContent = item.name;
        row.insertCell(2).textContent = item.quantity;
        row.insertCell(3).textContent = item.price.toFixed(2);
    });

    document.getElementById('totalPrice').textContent = `$${totalPrice.toFixed(2)}`;
}

// Function to complete purchase
function completePurchase() {
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const discount = parseFloat(localStorage.getItem('discount')) || 0;

    if (!customerName || !customerEmail || !paymentMethod) {
        alert('Please fill in all details.');
        return;
    }

    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
    const discountAmount = (discount / 100) * totalPrice;
    const finalAmount = totalPrice - discountAmount;

    // Save purchase details to Firebase
    const purchaseId = db.ref('purchases').push().key;
    db.ref(`purchases/${purchaseId}`).set({
        customerName,
        customerEmail,
        items: cartItems,
        totalPrice,
        discount,
        finalAmount,
        paymentMethod,
        purchaseDate: new Date().toISOString()
    }).then(() => {
        alert('Purchase completed successfully.');
        localStorage.removeItem('cartItems');
        localStorage.removeItem('customerName');
        localStorage.removeItem('customerEmail');
        localStorage.removeItem('discount');
        window.location.href = 'index.html'; // Redirect to home or another page
    }).catch(error => {
        console.error('Error completing purchase:', error);
    });
}

// Populate checkout page on load
window.onload = populateCheckout;
