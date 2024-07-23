// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCh17JupaGm8uCV3UI9DWjvfJ7PaVt2o-g",
    authDomain: "pet-store-billing.firebaseapp.com",
    databaseURL: "https://pet-store-billing-default-rtdb.firebaseio.com",
    projectId: "pet-store-billing",
    storageBucket: "pet-store-billing.appspot.com",
    messagingSenderId: "146782373741",
    appId: "1:146782373741:web:f79a227313a43edc81fc64",
    measurementId: "G-W67RCM2HYT"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Function to populate checkout page
function populateCheckout() {
    const customerName = localStorage.getItem('customerName');
    const customerEmail = localStorage.getItem('customerEmail');
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const discount = parseFloat(localStorage.getItem('discount')) || 0;

    document.getElementById('customerName').value = customerName || '';
    document.getElementById('customerEmail').value = customerEmail || '';

    const checkoutTableBody = document.getElementById('checkoutTable').getElementsByTagName('tbody')[0];
    checkoutTableBody.innerHTML = ''; // Clear existing rows

    let totalPrice = 0;

    cartItems.forEach(item => {
        const row = checkoutTableBody.insertRow();
        row.insertCell(0).textContent = item.barcode;
        row.insertCell(1).textContent = item.name;
        row.insertCell(2).textContent = item.quantity;
        const itemTotal = item.price * item.quantity;
        row.insertCell(3).textContent = itemTotal.toFixed(2);
        totalPrice += itemTotal;
    });

    const discountAmount = (totalPrice * (discount / 100)).toFixed(2);
    const finalAmount = (totalPrice - discountAmount).toFixed(2);

    document.getElementById('totalPrice').textContent = `Rs ${totalPrice.toFixed(2)}`;
    document.getElementById('discountAmount').textContent = `Rs ${discountAmount}`;
    document.getElementById('finalAmount').textContent = `Rs ${finalAmount}`;
}

// Function to complete purchase
function completePurchase() {
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const paymentMethod = document.getElementById('paymentMethod').value;

    if (!customerName || !customerEmail || !paymentMethod) {
        alert('Please fill in all details.');
        return;
    }

    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const discount = parseFloat(localStorage.getItem('discount')) || 0;
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = (totalPrice * (discount / 100)).toFixed(2);
    const finalAmount = (totalPrice - discountAmount).toFixed(2);

    // Save purchase details to Firebase
    const purchaseId = database.ref('purchases').push().key;
    database.ref(`purchases/${purchaseId}`).set({
        customerName,
        customerEmail,
        items: cartItems,
        totalPrice,
        discountAmount,
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
