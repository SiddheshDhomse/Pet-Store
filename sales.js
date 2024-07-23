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

// Function to populate year options
function populateYearOptions() {
    const currentYear = new Date().getFullYear();
    const yearSelect = document.getElementById('yearSelect');

    for (let year = currentYear; year >= currentYear - 10; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }

    // Load sales data for the current year by default
    yearSelect.value = currentYear;
    loadSalesData(currentYear);
}

// Function to load sales data for a selected year
function loadSalesData(year) {
    const salesTableBody = document.getElementById('salesTable').getElementsByTagName('tbody')[0];
    salesTableBody.innerHTML = ''; // Clear existing rows
    const salesChart = document.getElementById('salesChart').getContext('2d');

    const salesRef = database.ref('purchases');
    salesRef.orderByChild('purchaseDate').startAt(`${year}-01-01T00:00:00.000Z`).endAt(`${year}-12-31T23:59:59.999Z`).once('value', snapshot => {
        const monthlySales = Array(12).fill(0);
        let totalSales = 0;

        snapshot.forEach(childSnapshot => {
            const purchase = childSnapshot.val();
            const purchaseDate = new Date(purchase.purchaseDate);
            const month = purchaseDate.getMonth();
            const totalPrice = purchase.totalPrice;

            monthlySales[month] += totalPrice;
            totalSales += totalPrice;
        });

        // Update sales table
        monthlySales.forEach((sales, index) => {
            const row = salesTableBody.insertRow();
            row.insertCell(0).textContent = new Date(0, index).toLocaleString('default', { month: 'long' });
            row.insertCell(1).textContent = `Rs${sales.toFixed(2)}`;
        });

        // Update total sales for the year
        document.getElementById('totalSales').textContent = `Rs${totalSales.toFixed(2)}`;

        // Plot the sales data
        new Chart(salesChart, {
            type: 'bar',
            data: {
                labels: [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                ],
                datasets: [{
                    label: 'Monthly Sales',
                    data: monthlySales,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Sales (Rs)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    }
                }
            }
        });
    });
}

// Event listener for year selection
document.getElementById('yearSelect').addEventListener('change', (event) => {
    const selectedYear = event.target.value;
    loadSalesData(selectedYear);
});

// Populate year options on page load
window.onload = populateYearOptions;
