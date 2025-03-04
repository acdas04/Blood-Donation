class App {
    constructor() {
        this.initializeEventListeners();
        this.checkAuthStatus();
    }

    initializeEventListeners() {
        // Global event listeners
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.handleLogout());

        // Page-specific initializations
        this.routes = {
            '/': () => this.initHomePage(),
            '/search': () => this.initSearchPage(),
            '/login': () => this.initLoginPage(),
            '/register': () => this.initRegisterPage(),
            '/profile': () => this.initProfilePage(),
            '/donations': () => this.initDonationsPage()
        };
    }

    checkAuthStatus() {
        const isAuthenticated = auth.isAuthenticated();
        document.getElementById('authLinks').style.display = isAuthenticated ? 'none' : 'flex';
        document.getElementById('userLinks').style.display = isAuthenticated ? 'flex' : 'none';
    }

    async handleLogout() {
        auth.logout();
        this.checkAuthStatus();
        router.navigate('/');
    }

    // Page Initializations
    initHomePage() {
        // Home page initialization logic
    }

    initSearchPage() {
        const searchBtn = document.getElementById('searchBtn');
        const searchResults = document.getElementById('searchResults');

        if (searchBtn) {
            searchBtn.addEventListener('click', async () => {
                const bloodGroup = document.getElementById('searchBloodGroup').value;
                const location = document.getElementById('searchLocation').value;

                searchResults.innerHTML = '<div class="loading">Searching...</div>';

                try {
                    const { donors } = await donationService.searchDonors(bloodGroup, location);
                    this.displaySearchResults(donors);
                } catch (error) {
                    searchResults.innerHTML = '<div class="error">Error searching donors</div>';
                }
            });
        }
    }

    displaySearchResults(donors) {
        const searchResults = document.getElementById('searchResults');
        if (donors.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No donors found</div>';
            return;
        }

        searchResults.innerHTML = donors.map(donor => `
            <div class="donor-card">
                <h3>${donor.name}</h3>
                <p><i class="fas fa-tint"></i> ${donor.bloodGroup}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${donor.location}</p>
                <p><i class="fas fa-phone"></i> ${donor.phone}</p>
                ${auth.isAuthenticated() ?
                    `<button onclick="app.contactDonor('${donor.id}')" class="btn btn-secondary">
                        Contact Donor
                    </button>` :
                    `<a href="/login" class="btn btn-secondary">Login to Contact</a>`
                }
            </div>
        `).join('');
    }

    initLoginPage() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;

                try {
                    await auth.login(email, password);
                    this.checkAuthStatus();
                    router.navigate('/profile');
                } catch (error) {
                    utils.showNotification(error.message, 'error');
                }
            });
        }
    }

initRegisterPage() {
    console.log('Register page initialization started');

    // Add a flag to track if we've already initialized
    if (window.registerInitialized) {
        console.log('Register page already initialized, skipping');
        return;
    }
    window.registerInitialized = true;

    const attachEventListeners = () => {
        const registerForm = document.getElementById('registerForm');
        const emailInput = document.getElementById('email');
        const emailError = document.getElementById('emailError');

        if (registerForm && emailInput && emailError) {
            console.log('Register form and email input found, setting up event listeners');

            // Email availability check on blur
            emailInput.addEventListener('blur', async () => {
                const email = emailInput.value;
                if (email) {
                    try {
                        console.log('Checking email availability for:', email);
                        const isAvailable = await auth.checkEmailAvailability(email);
                        if (!isAvailable) {
                            emailError.textContent = 'This email is already registered';
                        } else {
                            emailError.textContent = '';
                        }
                    } catch (error) {
                        console.error('Email availability check error:', error);
                        emailError.textContent = '';
                    }
                }
            });

            // Form submission handler
            const handleSubmit = async (e) => {
                console.log('Form submission intercepted'); // Debugging
                e.preventDefault(); // Ensure this is called
                console.log('Default form submission prevented'); // Debugging

                const email = document.getElementById('email').value;
                const name = document.getElementById('name').value;
                const password = document.getElementById('password').value;
                const bloodGroup = document.getElementById('bloodGroup').value;
                const phone = document.getElementById('phone').value;
                const location = document.getElementById('location').value;

                // Validate form fields
                if (!name || !email || !password || !bloodGroup || !phone || !location) {
                    utils.showNotification('Please fill out all fields', 'error');
                    return;
                }

                try {
                    console.log('Checking email availability before submission');
                    const isAvailable = await auth.checkEmailAvailability(email);
                    console.log('Email availability result:', isAvailable);
                    if (!isAvailable) {
                        utils.showNotification('This email is already registered', 'error');
                        return;
                    }

                    const formData = {
                        name,
                        email,
                        password,
                        bloodGroup,
                        phone,
                        location
                    };

                    console.log('Submitting form data:', formData);

                    const response = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });

                    console.log('Form submission response:', response);

                    if (!response.ok) {
                        const errorData = await response.json();
                        if (errorData.code === 'EMAIL_EXISTS') {
                            utils.showNotification('This email is already registered', 'error');
                        } else {
                            throw new Error(errorData.message || 'Registration failed');
                        }
                        return;
                    }

                    utils.showNotification('Registration successful! Please login.', 'success');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1500);
                } catch (error) {
                    console.error('Registration error:', error);
                    utils.showNotification(`Registration failed: ${error.message}`, 'error');
                }
            };

            // Attach submit event listener to the form
            registerForm.addEventListener('submit', handleSubmit);
            console.log('Submit event listener attached to form');

            // Attach click event listener to the submit button (as a fallback)
            const submitButton = registerForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Submit button clicked, triggering form submit');
                    handleSubmit(e);
                });
                console.log('Click event listener attached to submit button');
            }
        }
    };

    // Attach event listeners immediately if the form is already in the DOM
    attachEventListeners();

    // Use MutationObserver to attach event listeners if the form is added to the DOM later
    const observer = new MutationObserver((mutations, obs) => {
        const registerForm = document.getElementById('registerForm');
        const emailInput = document.getElementById('email');
        const emailError = document.getElementById('emailError');

        if (registerForm && emailInput && emailError) {
            console.log('Register form and email input found by MutationObserver, setting up event listeners');
            obs.disconnect(); // Stop observing
            attachEventListeners();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

    async initProfilePage() {
        if (!auth.isAuthenticated()) {
            router.navigate('/login');
            return;
        }

        const profileData = document.getElementById('profileData');
        const editProfileBtn = document.getElementById('editProfileBtn');
        const editProfileModal = document.getElementById('editProfileModal');

        try {
            const { profile } = await donationService.getProfile();
            this.displayProfile(profile);
        } catch (error) {
            profileData.innerHTML = '<div class="error">Error loading profile</div>';
        }

        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                editProfileModal.style.display = 'block';
                this.initializeProfileEdit();
            });
        }
    }

    displayProfile(profile) {
        const profileData = document.getElementById('profileData');
        profileData.innerHTML = `
            <div class="profile-info">
                <p><strong>Name:</strong> ${profile.name}</p>
                <p><strong>Email:</strong> ${profile.email}</p>
                <p><strong>Blood Group:</strong> ${profile.bloodGroup}</p>
                <p><strong>Phone:</strong> ${profile.phone}</p>
                <p><strong>Location:</strong> ${profile.location}</p>
            </div>
        `;
    }

    async initDonationsPage() {
        if (!auth.isAuthenticated()) {
            router.navigate('/login');
            return;
        }

        const addDonationBtn = document.getElementById('addDonationBtn');
        const donationsList = document.getElementById('donationsList');

        try {
            const { donations } = await donationService.getDonationHistory();
            this.displayDonations(donations);
        } catch (error) {
            donationsList.innerHTML = '<div class="error">Error loading donations</div>';
        }

        if (addDonationBtn) {
            addDonationBtn.addEventListener('click', () => {
                document.getElementById('addDonationModal').style.display = 'block';
                this.initializeAddDonation();
            });
        }
    }

    displayDonations(donations) {
        const donationsList = document.getElementById('donationsList');
        if (donations.length === 0) {
            donationsList.innerHTML = '<div class="no-results">No donations recorded yet</div>';
            return;
        }

        donationsList.innerHTML = donations.map(donation => `
            <div class="donation-card">
                <div class="donation-date">
                    <i class="fas fa-calendar"></i>
                    ${utils.formatDate(donation.donationDate)}
                </div>
                <div class="next-date">
                    <i class="fas fa-clock"></i>
                    Next eligible: ${utils.formatDate(donation.nextAvailableDate)}
                </div>
            </div>
        `).join('');
    }

    async contactDonor(donorId) {
        // Implement contact functionality
        utils.showNotification('Contact feature coming soon!', 'info');
    }

    initializeProfileEdit() {
        const editProfileForm = document.getElementById('editProfileForm');
        const closeBtn = document.querySelector('.close');

        closeBtn.addEventListener('click', () => {
            document.getElementById('editProfileModal').style.display = 'none';
        });

        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                name: document.getElementById('editName').value,
                phone: document.getElementById('editPhone').value,
                location: document.getElementById('editLocation').value
            };

            try {
                await donationService.updateProfile(formData);
                document.getElementById('editProfileModal').style.display = 'none';
                this.initProfilePage(); // Refresh profile data
                utils.showNotification('Profile updated successfully');
            } catch (error) {
                utils.showNotification(error.message, 'error');
            }
        });
    }

    initializeAddDonation() {
        const addDonationForm = document.getElementById('addDonationForm');
        const closeBtn = document.querySelector('.close');

        closeBtn.addEventListener('click', () => {
            document.getElementById('addDonationModal').style.display = 'none';
        });

        addDonationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const donationDate = document.getElementById('donationDate').value;

            try {
                await donationService.addDonation(donationDate);
                document.getElementById('addDonationModal').style.display = 'none';
                this.initDonationsPage(); // Refresh donations list
                utils.showNotification('Donation recorded successfully');
            } catch (error) {
                utils.showNotification(error.message, 'error');
            }
        });
    }
}

// Initialize the application after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    window.app = app; // Make app accessible globally for event handlers

    // Handle route changes
    window.addEventListener('popstate', () => {
        const path = window.location.pathname;
        if (app.routes[path]) {
            app.routes[path]();
        }
    });

    // Initialize current page
    const path = window.location.pathname;
    if (app.routes[path]) {
        app.routes[path]();
    }
});