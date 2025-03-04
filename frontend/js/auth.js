class AuthService {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }

    async login(email, password) {
        try {
            const data = await utils.fetchWithAuth('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            this.setSession(data.token, data.user);
            utils.showNotification('Login successful');
            return data;
        } catch (error) {
            throw error;
        }
    }
    async checkEmailAvailability(email) {
        try {
            const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
            if (!response.ok) {
                throw new Error('Failed to check email availability');
            }
            const data = await response.json();
            return data.available;
        } catch (error) {
            throw error;
        }
    }

    async register(userData) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            const data = await response.json();
            utils.showNotification('Registration successful');
            return data;
        } catch (error) {
            throw error;
        }
    }

    setSession(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        utils.showNotification('Logged out successfully');
    }

    isAuthenticated() {
        return !!this.token;
    }

    getUser() {
        return this.user;
    }
}

const auth = new AuthService();