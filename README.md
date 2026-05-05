# MTC TOURE - Tour Management System

A full-stack web application for managing and booking tours built with Python Flask, MySQL, HTML, CSS, and JavaScript.

## Features

- **User Authentication**: Registration and login system
- **Tour Browsing**: Browse available tours with filters and search
- **Booking System**: Reserve tours with customizable participants
- **Reviews & Ratings**: Leave reviews and see tour ratings
- **User Dashboard**: View your bookings and profile
- **Responsive Design**: Mobile-friendly interface
- **Tour Management**: Complete itinerary and tour details

## Project Structure

```
MTC-TOURE/
├── app.py                      # Flask application
├── database.sql               # Database schema
├── requirements.txt           # Python dependencies
├── templates/                 # HTML templates
│   ├── index.html
│   └── auth/
│       ├── login.html
│       └── register.html
└── static/                    # Static files
    ├── css/
    │   ├── style.css
    │   └── auth.css
    └── js/
        └── app.js
```

## Installation

### Prerequisites
- Python 3.8+
- MySQL Server
- pip (Python package manager)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/ganeshvijaykamble/MTC-TOURE.git
   cd MTC-TOURE
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup MySQL Database**
   ```bash
   mysql -u root -p < database.sql
   ```

5. **Update database configuration in app.py**
   ```python
   app.config['MYSQL_HOST'] = 'localhost'
   app.config['MYSQL_USER'] = 'root'
   app.config['MYSQL_PASSWORD'] = 'your_password'
   app.config['MYSQL_DB'] = 'tour_db'
   ```

6. **Run the application**
   ```bash
   python app.py
   ```

7. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

## Database Schema

### Tables
- **users**: User authentication and profile data
- **tours**: Tour information and details
- **bookings**: User tour bookings
- **reviews**: Tour reviews and ratings
- **itinerary**: Daily tour itinerary

## API Endpoints

### Authentication
- `POST /register` - User registration
- `POST /login` - User login
- `GET /logout` - User logout

### Tours
- `GET /api/tours` - Get all available tours
- `GET /api/tour/<id>` - Get specific tour details

### Bookings
- `POST /api/book` - Book a tour
- `GET /api/my-bookings` - Get user bookings

### Reviews
- `GET /api/reviews/<tour_id>` - Get tour reviews
- `POST /api/review` - Submit a review

### Profile
- `GET /api/profile` - Get user profile
- `POST /api/profile/update` - Update user profile

## Technologies Used

- **Backend**: Python Flask
- **Database**: MySQL
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Server**: Flask Development Server

## Features in Detail

### User Authentication
- Secure password hashing
- Session management
- Login/Logout functionality

### Tour Management
- Search and filter tours
- View detailed tour information
- Check availability
- View itinerary

### Booking System
- Select number of participants
- Add special requests
- Real-time price calculation
- Booking confirmation

### Reviews & Ratings
- 5-star rating system
- User reviews with comments
- Average rating calculation

## Future Enhancements

- Payment gateway integration
- Email notifications
- Admin dashboard
- Advanced filtering options
- User feedback system
- Tour image uploads
- Cancellation and refunds
- PDF booking confirmation

## Author

Ganesh Vijay Kamble

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please create an issue on GitHub.
