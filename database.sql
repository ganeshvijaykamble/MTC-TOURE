-- Create database
CREATE DATABASE IF NOT EXISTS tour_db;
USE tour_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    address TEXT,
    city VARCHAR(50),
    country VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tours table
CREATE TABLE IF NOT EXISTS tours (
    tour_id INT AUTO_INCREMENT PRIMARY KEY,
    tour_name VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    description TEXT,
    duration_days INT NOT NULL,
    price_per_person DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    max_participants INT DEFAULT 50,
    current_participants INT DEFAULT 0,
    tour_guide_name VARCHAR(100),
    tour_guide_phone VARCHAR(15),
    included_activities TEXT,
    accommodation_type VARCHAR(50),
    meals_included BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tour_id INT NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    number_of_participants INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    booking_status ENUM('confirmed', 'pending', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('paid', 'pending', 'refunded') DEFAULT 'pending',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tour_id) REFERENCES tours(tour_id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tour_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tour_id) REFERENCES tours(tour_id) ON DELETE CASCADE
);

-- Itinerary table
CREATE TABLE IF NOT EXISTS itinerary (
    itinerary_id INT AUTO_INCREMENT PRIMARY KEY,
    tour_id INT NOT NULL,
    day_number INT NOT NULL,
    location VARCHAR(100),
    activities TEXT,
    accommodation VARCHAR(100),
    meals TEXT,
    FOREIGN KEY (tour_id) REFERENCES tours(tour_id) ON DELETE CASCADE
);

-- Sample data for tours
INSERT INTO tours (tour_name, destination, description, duration_days, price_per_person, start_date, end_date, max_participants, tour_guide_name, tour_guide_phone, included_activities, accommodation_type, meals_included)
VALUES 
('Paris City Tour', 'Paris, France', 'Explore the City of Light with visits to Eiffel Tower, Louvre Museum, and Notre-Dame', 5, 1500.00, '2026-06-15', '2026-06-20', 30, 'Jean Dupont', '+33612345678', 'Eiffel Tower, Louvre Museum, Notre-Dame, Seine River Cruise, Versailles', 'Hotel 4-star', TRUE),
('Tokyo Adventure', 'Tokyo, Japan', 'Experience modern and traditional Japan with temples, gardens, and street food tours', 7, 2200.00, '2026-07-01', '2026-07-08', 25, 'Yamamoto Kenji', '+81901234567', 'Temple Visits, Sumo Wrestling, Cherry Gardens, Shibuya Crossing Tour', 'Hotel 4-star', TRUE),
('Safari in Kenya', 'Kenya, Africa', 'Wild safari experience with lion, elephant, and giraffe sightings', 6, 2800.00, '2026-08-10', '2026-08-16', 20, 'James Kariuki', '+254712345678', 'Safari Drives, Wildlife Photography, Maasai Village Visit, Hot Air Balloon', 'Safari Lodge', TRUE),
('Swiss Alps Trek', 'Switzerland', 'Mountain trekking with breathtaking views of Alps and alpine villages', 4, 1800.00, '2026-09-05', '2026-09-09', 15, 'Hans Mueller', '+41791234567', 'Mountain Hiking, Cable Car Rides, Village Tours, Chocolate Factory', 'Mountain Hotel', TRUE),
('Bali Relaxation', 'Bali, Indonesia', 'Beach relaxation, temple visits, and yoga retreats in paradise', 5, 1200.00, '2026-10-20', '2026-10-25', 40, 'I Made Putra', '+6281234567890', 'Beach Days, Ubud Temple Tour, Rice Terrace Trek, Yoga Classes', 'Beach Resort', TRUE);
