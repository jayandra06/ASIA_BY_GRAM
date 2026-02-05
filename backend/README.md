# Asia By Gram Backend

This is the custom Node.js backend for the Asia By Gram application.

## Setup

1.  **Install Dependencies**:
    ```bash
    cd backend
    npm install
    ```

2.  **Configure Environment**:
    The `.env` file is pre-configured for local development. adjust `MONGODB_URI` if you have a specific database.
    ```env
    MONGODB_URI=mongodb://localhost:27017/asia_by_gram
    JWT_SECRET=your_jwt_secret_key
    PORT=5000
    ```

3.  **Start the Server**:
    ```bash
    npm run dev
    ```

## API Endpoints

-   **Auth**:
    -   `POST /api/auth/register` - Create a new admin
    -   `POST /api/auth/login` - Login admin

-   **Menu**:
    -   `GET /api/menu` - Get all items
    -   `POST /api/menu` - Add item (Protected)
    -   `PUT /api/menu/:id` - Update item (Protected)
    -   `DELETE /api/menu/:id` - Delete item (Protected)

-   **Reservations**:
    -   `POST /api/reservations` - Create reservation
    -   `GET /api/reservations` - Get all reservations (Protected)
