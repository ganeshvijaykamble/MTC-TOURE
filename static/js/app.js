let toursData = [];
let currentTourId = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkUserStatus();
    setupEventListeners();
});

function checkUserStatus() {
    const authLinks = document.getElementById('authLinks');
    const userLinks = document.getElementById('userLinks');
    
    // Check if user is logged in (this would typically be done via API)
    // For now, check session via API
    fetch('/api/profile')
        .then(response => {
            if (response.ok) {
                authLinks.style.display = 'none';
                userLinks.style.display = 'flex';
            } else {
                authLinks.style.display = 'flex';
                userLinks.style.display = 'none';
            }
        })
        .catch(error => {
            authLinks.style.display = 'flex';
            userLinks.style.display = 'none';
        });
}

function setupEventListeners() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
}

function scrollTo(section) {
    const element = document.getElementById(section);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Load tours from API
function loadTours() {
    fetch('/api/tours')
        .then(response => response.json())
        .then(data => {
            toursData = data;
            displayTours(data);
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('toursGrid').innerHTML = '<p>Error loading tours</p>';
        });
}

function displayTours(tours) {
    const toursGrid = document.getElementById('toursGrid');
    
    if (tours.length === 0) {
        toursGrid.innerHTML = '<p>No tours available</p>';
        return;
    }

    toursGrid.innerHTML = tours.map(tour => `
        <div class="tour-card" onclick="showTourDetails(${tour.tour_id})">
            <div class="tour-image">
                <i class="fas fa-map-marker-alt"></i>
            </div>
            <div class="tour-content">
                <h3>${tour.tour_name}</h3>
                <p class="tour-destination">${tour.destination}</p>
                <div class="tour-info">
                    <div class="tour-info-item">
                        <i class="fas fa-calendar"></i>
                        <span>${tour.duration_days} days</span>
                    </div>
                    <div class="tour-info-item">
                        <i class="fas fa-users"></i>
                        <span>${tour.current_participants}/${tour.max_participants}</span>
                    </div>
                </div>
                <div class="tour-rating">
                    <i class="fas fa-star"></i> ${tour.avg_rating ? tour.avg_rating.toFixed(1) : 'New'}
                </div>
                <div class="tour-price">$${tour.price_per_person}</div>
                <button class="tour-button" onclick="event.stopPropagation(); bookTour(${tour.tour_id})">Book Now</button>
            </div>
        </div>
    `).join('');
}

function filterTours() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const priceFilter = document.getElementById('priceFilter').value;

    const filtered = toursData.filter(tour => {
        const matchesSearch = tour.tour_name.toLowerCase().includes(searchInput) || 
                            tour.destination.toLowerCase().includes(searchInput);
        const matchesPrice = !priceFilter || tour.price_per_person <= parseFloat(priceFilter);
        return matchesSearch && matchesPrice;
    });

    displayTours(filtered);
}

function showTourDetails(tourId) {
    fetch(`/api/tour/${tourId}`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                displayTourDetails(data);
                document.getElementById('tourModal').style.display = 'block';
            }
        })
        .catch(error => console.error('Error:', error));
}

function displayTourDetails(tour) {
    const detailsDiv = document.getElementById('tourDetails');
    const itinerary = tour.itinerary || [];

    detailsDiv.innerHTML = `
        <h2>${tour.tour_name}</h2>
        <p class="tour-destination">${tour.destination}</p>
        <p>${tour.description}</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
            <div>
                <strong>Duration:</strong> ${tour.duration_days} days<br>
                <strong>Price:</strong> $${tour.price_per_person} per person<br>
                <strong>Tour Guide:</strong> ${tour.tour_guide_name}<br>
                <strong>Available Spots:</strong> ${tour.max_participants - tour.current_participants}
            </div>
            <div>
                <strong>Dates:</strong> ${tour.start_date} to ${tour.end_date}<br>
                <strong>Accommodation:</strong> ${tour.accommodation_type}<br>
                <strong>Meals Included:</strong> ${tour.meals_included ? 'Yes' : 'No'}<br>
                <strong>Rating:</strong> <span class="tour-rating"><i class="fas fa-star"></i> ${tour.avg_rating ? tour.avg_rating.toFixed(1) : 'New'}</span>
            </div>
        </div>

        <h4>Included Activities:</h4>
        <p>${tour.included_activities}</p>

        ${itinerary.length > 0 ? `
            <h4>Daily Itinerary:</h4>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                ${itinerary.map(item => `
                    <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #ddd;">
                        <strong>Day ${item.day_number}: ${item.location}</strong><br>
                        <p>${item.activities}</p>
                        <small>Accommodation: ${item.accommodation} | Meals: ${item.meals}</small>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        <h4>Reviews (${tour.review_count || 0})</h4>
        <div id="reviewsList" style="margin-top: 15px;"></div>
        
        <div style="margin-top: 20px;">
            <h4>Leave a Review:</h4>
            <form onsubmit="submitReview(event, ${tour.tour_id})" style="display: grid; gap: 10px;">
                <div>
                    <label>Rating:</label>
                    <select id="rating" required style="width: 100%; padding: 8px;">
                        <option value="">Select rating</option>
                        <option value="5">5 Stars - Excellent</option>
                        <option value="4">4 Stars - Good</option>
                        <option value="3">3 Stars - Average</option>
                        <option value="2">2 Stars - Poor</option>
                        <option value="1">1 Star - Very Poor</option>
                    </select>
                </div>
                <div>
                    <label>Review:</label>
                    <textarea id="reviewText" rows="4" style="width: 100%; padding: 8px; border: 2px solid #ddd; border-radius: 5px;"></textarea>
                </div>
                <button type="submit" class="btn-primary">Submit Review</button>
            </form>
        </div>
    `;

    loadReviews(tour.tour_id);
}

function loadReviews(tourId) {
    fetch(`/api/reviews/${tourId}`)
        .then(response => response.json())
        .then(data => {
            const reviewsList = document.getElementById('reviewsList');
            if (data && data.length > 0) {
                reviewsList.innerHTML = data.map(review => `
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                        <strong>${review.full_name}</strong>
                        <div class="tour-rating">
                            ${'<i class="fas fa-star"></i>'.repeat(review.rating)}
                        </div>
                        <p>${review.review_text}</p>
                    </div>
                `).join('');
            } else {
                reviewsList.innerHTML = '<p>No reviews yet</p>';
            }
        })
        .catch(error => console.error('Error:', error));
}

function submitReview(event, tourId) {
    event.preventDefault();
    const rating = document.getElementById('rating').value;
    const reviewText = document.getElementById('reviewText').value;

    fetch('/api/review', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tour_id: tourId,
            rating: parseInt(rating),
            review_text: reviewText
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Review submitted successfully');
            document.getElementById('rating').value = '';
            document.getElementById('reviewText').value = '';
            loadReviews(tourId);
        } else {
            alert('Error submitting review: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

function closeTourModal() {
    document.getElementById('tourModal').style.display = 'none';
}

function bookTour(tourId) {
    currentTourId = tourId;
    const tour = toursData.find(t => t.tour_id === tourId);
    
    if (!tour) return;

    const maxParticipants = tour.max_participants - tour.current_participants;
    document.getElementById('participants').max = maxParticipants;
    document.getElementById('participants').value = 1;
    
    updateBookingTotal(tour.price_per_person);
    document.getElementById('bookingModal').style.display = 'block';
    closeTourModal();
}

function updateBookingTotal(pricePerPerson) {
    const participants = document.getElementById('participants').value;
    const total = pricePerPerson * participants;
    document.getElementById('bookingTotal').innerHTML = `<p>Total: $${total.toFixed(2)}</p>`;
}

document.addEventListener('change', function(e) {
    if (e.target.id === 'participants' && currentTourId) {
        const tour = toursData.find(t => t.tour_id === currentTourId);
        if (tour) {
            updateBookingTotal(tour.price_per_person);
        }
    }
});

function submitBooking(event) {
    event.preventDefault();
    
    if (!currentTourId) return;

    const participants = document.getElementById('participants').value;
    const specialRequests = document.getElementById('specialRequests').value;

    fetch('/api/book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tour_id: currentTourId,
            number_of_participants: parseInt(participants),
            special_requests: specialRequests
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Booking confirmed! Total: $' + data.total_price.toFixed(2));
            closeBookingModal();
            loadTours();
        } else {
            alert('Booking failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error submitting booking');
    });
}

function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

function loadMyBookings() {
    fetch('/api/my-bookings')
        .then(response => {
            if (!response.ok) {
                window.location.href = '/login';
                return;
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                displayMyBookings(data);
            }
        })
        .catch(error => console.error('Error:', error));
}

function displayMyBookings(bookings) {
    // This would display user bookings - implementation depends on your UI design
    console.log('My Bookings:', bookings);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const tourModal = document.getElementById('tourModal');
    const bookingModal = document.getElementById('bookingModal');
    
    if (event.target == tourModal) {
        tourModal.style.display = 'none';
    }
    if (event.target == bookingModal) {
        bookingModal.style.display = 'none';
    }
}
