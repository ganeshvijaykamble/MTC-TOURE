from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_mysqldb import MySQL
import MySQLdb.cursors
import re
import hashlib
import os
from datetime import datetime
from functools import wraps

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this'

# MySQL Configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'password'
app.config['MYSQL_DB'] = 'tour_db'

mysql = MySQL(app)

# Decorator for login check
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Hash password
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# HOME ROUTE
@app.route('/')
def index():
    return render_template('index.html')

# AUTHENTICATION ROUTES
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        full_name = request.form.get('full_name')

        if not all([username, email, password, confirm_password, full_name]):
            return jsonify({'success': False, 'message': 'All fields are required'}), 400

        if password != confirm_password:
            return jsonify({'success': False, 'message': 'Passwords do not match'}), 400

        if len(password) < 6:
            return jsonify({'success': False, 'message': 'Password must be at least 6 characters'}), 400

        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM users WHERE username = %s OR email = %s', (username, email))
        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({'success': False, 'message': 'Username or email already exists'}), 400

        hashed_password = hash_password(password)
        cursor.execute('INSERT INTO users (username, email, password, full_name) VALUES (%s, %s, %s, %s)',
                      (username, email, hashed_password, full_name))
        mysql.connection.commit()
        cursor.close()

        return jsonify({'success': True, 'message': 'Registration successful. Please login.'})

    return render_template('auth/register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        if not username or not password:
            return jsonify({'success': False, 'message': 'Username and password required'}), 400

        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM users WHERE username = %s', (username,))
        user = cursor.fetchone()
        cursor.close()

        if user and user['password'] == hash_password(password):
            session['user_id'] = user['user_id']
            session['username'] = user['username']
            session['full_name'] = user['full_name']
            return jsonify({'success': True, 'message': 'Login successful'})
        else:
            return jsonify({'success': False, 'message': 'Invalid username or password'}), 401

    return render_template('auth/login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

# TOURS ROUTES
@app.route('/api/tours')
def get_tours():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM tours WHERE start_date >= CURDATE() ORDER BY start_date')
    tours = cursor.fetchall()
    cursor.close()
    
    for tour in tours:
        tour['start_date'] = str(tour['start_date'])
        tour['end_date'] = str(tour['end_date'])
    
    return jsonify(tours)

@app.route('/api/tour/<int:tour_id>')
def get_tour(tour_id):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM tours WHERE tour_id = %s', (tour_id,))
    tour = cursor.fetchone()
    
    if tour:
        cursor.execute('SELECT * FROM itinerary WHERE tour_id = %s ORDER BY day_number', (tour_id,))
        itinerary = cursor.fetchall()
        tour['itinerary'] = itinerary
        
        cursor.execute('SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE tour_id = %s', (tour_id,))
        rating = cursor.fetchone()
        tour['avg_rating'] = rating['avg_rating']
        tour['review_count'] = rating['review_count']
    
    cursor.close()
    return jsonify(tour)

# BOOKINGS ROUTES
@app.route('/api/book', methods=['POST'])
@login_required
def book_tour():
    data = request.get_json()
    tour_id = data.get('tour_id')
    number_of_participants = data.get('number_of_participants')
    special_requests = data.get('special_requests', '')

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM tours WHERE tour_id = %s', (tour_id,))
    tour = cursor.fetchone()

    if not tour:
        return jsonify({'success': False, 'message': 'Tour not found'}), 404

    available_spots = tour['max_participants'] - tour['current_participants']
    if number_of_participants > available_spots:
        return jsonify({'success': False, 'message': f'Only {available_spots} spots available'}), 400

    total_price = tour['price_per_person'] * number_of_participants

    cursor.execute('INSERT INTO bookings (user_id, tour_id, number_of_participants, total_price, special_requests) VALUES (%s, %s, %s, %s, %s)',
                  (session['user_id'], tour_id, number_of_participants, total_price, special_requests))
    
    cursor.execute('UPDATE tours SET current_participants = current_participants + %s WHERE tour_id = %s',
                  (number_of_participants, tour_id))
    
    mysql.connection.commit()
    cursor.close()

    return jsonify({'success': True, 'message': 'Booking confirmed!', 'total_price': total_price})

@app.route('/api/my-bookings')
@login_required
def my_bookings():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('''SELECT b.*, t.tour_name, t.destination, t.start_date, t.end_date 
                     FROM bookings b 
                     JOIN tours t ON b.tour_id = t.tour_id 
                     WHERE b.user_id = %s 
                     ORDER BY b.booking_date DESC''', (session['user_id'],))
    bookings = cursor.fetchall()
    cursor.close()
    
    for booking in bookings:
        booking['booking_date'] = str(booking['booking_date'])
        booking['start_date'] = str(booking['start_date'])
        booking['end_date'] = str(booking['end_date'])
    
    return jsonify(bookings)

# REVIEWS ROUTES
@app.route('/api/reviews/<int:tour_id>')
def get_reviews(tour_id):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('''SELECT r.*, u.full_name 
                     FROM reviews r 
                     JOIN users u ON r.user_id = u.user_id 
                     WHERE r.tour_id = %s 
                     ORDER BY r.review_date DESC''', (tour_id,))
    reviews = cursor.fetchall()
    cursor.close()
    return jsonify(reviews)

@app.route('/api/review', methods=['POST'])
@login_required
def add_review():
    data = request.get_json()
    tour_id = data.get('tour_id')
    rating = data.get('rating')
    review_text = data.get('review_text')

    if not all([tour_id, rating, review_text]):
        return jsonify({'success': False, 'message': 'All fields required'}), 400

    if not (1 <= rating <= 5):
        return jsonify({'success': False, 'message': 'Rating must be between 1 and 5'}), 400

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('INSERT INTO reviews (user_id, tour_id, rating, review_text) VALUES (%s, %s, %s, %s)',
                  (session['user_id'], tour_id, rating, review_text))
    mysql.connection.commit()
    cursor.close()

    return jsonify({'success': True, 'message': 'Review added successfully'})

# USER PROFILE
@app.route('/api/profile')
@login_required
def get_profile():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM users WHERE user_id = %s', (session['user_id'],))
    user = cursor.fetchone()
    cursor.close()
    
    if user:
        user.pop('password', None)  # Remove password from response
    
    return jsonify(user)

@app.route('/api/profile/update', methods=['POST'])
@login_required
def update_profile():
    data = request.get_json()
    user_id = session['user_id']
    
    full_name = data.get('full_name')
    phone = data.get('phone')
    address = data.get('address')
    city = data.get('city')
    country = data.get('country')

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('''UPDATE users SET full_name = %s, phone = %s, address = %s, city = %s, country = %s 
                     WHERE user_id = %s''',
                  (full_name, phone, address, city, country, user_id))
    mysql.connection.commit()
    cursor.close()

    return jsonify({'success': True, 'message': 'Profile updated successfully'})

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)
