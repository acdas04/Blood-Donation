const utils = {
    showNotification: (message, type = 'info') => {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        // Clear any existing timeouts
        if (notification.hideTimeout) {
            clearTimeout(notification.hideTimeout);
        }
        
        // Remove hide class if present
        notification.classList.remove('hide');
        
        // Set the message and type
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        // Hide after 3 seconds with animation
        notification.hideTimeout = setTimeout(() => {
            notification.classList.replace('show', 'hide');
            
            // Actually hide the element after animation completes
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300); // Match the animation duration
        }, 3000);
    },
    

    fetchWithAuth: async (url, options = {}) => {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'An error occurred');
        }

        return await response.json();
    },

    validateForm: (formData, rules) => {
        const errors = {};
        
        for (const [field, value] of Object.entries(formData)) {
            const fieldRules = rules[field];
            if (!fieldRules) continue;

            if (fieldRules.required && !value) {
                errors[field] = `${field} is required`;
                continue;
            }

            if (fieldRules.minLength && value.length < fieldRules.minLength) {
                errors[field] = `${field} must be at least ${fieldRules.minLength} characters`;
            }

            if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
                errors[field] = `${field} format is invalid`;
            }
        }

        return Object.keys(errors).length ? errors : null;
    },

    isValidDonationDate: (date) => {
        const donationDate = new Date(date);
        const today = new Date();
        return donationDate <= today;
    },

    canDonate: (lastDonationDate) => {
        if (!lastDonationDate) return true;
        
        const lastDonation = new Date(lastDonationDate);
        const today = new Date();
        const diffMonths = (today.getFullYear() - lastDonation.getFullYear()) * 12 + 
                          (today.getMonth() - lastDonation.getMonth());
        
        return diffMonths >= 3;
    },

    storage: {
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.error('Error saving to localStorage:', error);
            }
        },
        
        get: (key) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (error) {
                console.error('Error reading from localStorage:', error);
                return null;
            }
        },
        
        remove: (key) => {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error('Error removing from localStorage:', error);
            }
        }
    },

    handleApiError: (error) => {
        if (error.response?.status === 401) {
            auth.logout();
            router.navigate('/login');
            return 'Session expired. Please login again.';
        }
        
        return error.message || 'An unexpected error occurred';
    }
};