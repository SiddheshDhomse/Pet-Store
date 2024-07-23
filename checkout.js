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
    const customerName = sessionStorage.getItem('customerName');
    const customerEmail = sessionStorage.getItem('customerEmail');
    const cartItems = JSON.parse(sessionStorage.getItem('cartItems')) || [];
    const discount = parseFloat(sessionStorage.getItem('discount')) || 0;

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
        const itemTotal = item.price; // item.price already includes the total price for quantity
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

    const cartItems = JSON.parse(sessionStorage.getItem('cartItems')) || [];
    const discount = parseFloat(sessionStorage.getItem('discount')) || 0;
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
    const discountAmount = (totalPrice * (discount / 100)).toFixed(2);
    const finalAmount = (totalPrice - discountAmount).toFixed(2);

    // Save purchase details to Firebase
    const purchaseId = database.ref('purchases').push().key;
    database.ref(`purchases/${purchaseId}`).set({
        customerName,
        customerEmail,
        items: cartItems,
        totalPrice: totalPrice.toFixed(2),
        discount: discountAmount,
        finalAmount: finalAmount,
        paymentMethod,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        alert('Purchase completed successfully!');
        // Clear sessionStorage
        sessionStorage.clear();
        // Optionally redirect or refresh the page
        window.location.href = 'index.html';
    }).catch(error => {
        console.error('Error completing purchase:', error);
        alert('An error occurred while completing the purchase. Please try again.');
    });
}

// Populate checkout page on load
window.onload = populateCheckout;

// Attach event listener to complete purchase button

// Function to print the bill as PDF
window.printPDF = function() {
    const docDefinition = {
        content: [
            { text: 'PETS GLORIOUS', style: 'header' },
            { text: `Bill No.: ${Math.floor(Math.random() * 100000)}`, margin: [0, 20] },
            { text: `Date: ${new Date().toLocaleDateString()}`, margin: [0, 10] },
            { text: 'Customer Details', style: 'subheader', margin: [0, 20] },
            {
                columns: [
                    { width: '*', text: `Name: ${document.getElementById('customerName').value}` },
                    { width: '*', text: `Email: ${document.getElementById('customerEmail').value}` },
                ]
            },
            { text: 'Items Purchased', style: 'subheader', margin: [0, 20] },
            {
                table: {
                    widths: [ '*', '*', '*', '*' ],
                    body: [
                        [ 'Barcode', 'Product Name', 'Quantity', 'Price' ],
                        ...Array.from(document.querySelectorAll('#checkoutTable tbody tr')).map(row => {
                            return Array.from(row.children).map(cell => cell.textContent);
                        })
                    ]
                }
            },
            { text: `Total Price: Rs ${document.getElementById('totalPrice').textContent.replace('Rs ', '')}`, margin: [0, 10] },
            { text: `Discount: Rs ${document.getElementById('discountAmount').textContent.replace('Rs ', '')}`, margin: [0, 10] },
            { text: `Final Amount: Rs ${document.getElementById('finalAmount').textContent.replace('Rs ', '')}`, margin: [0, 10] },
            { text: `Payment Method: ${document.getElementById('paymentMethod').value}`, margin: [0, 10] }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                alignment: 'center'
            },
            subheader: {
                fontSize: 14,
                bold: true,
                margin: [0, 10]
            }
        }
    };

    pdfMake.createPdf(docDefinition).download('bill.pdf');
};

