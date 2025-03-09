// frontend/js/router.js
class Router {
    constructor() {
        this.routes = {
            '/': { template: '/pages/home.html', title: 'Home' },
            '/search': { template: '/pages/search.html', title: 'Search Donors' },
            '/login': { template: '/pages/login.html', title: 'Login' },
            '/register': { template: '/pages/register.html', title: 'Register' },
            '/profile': { 
                template: '/pages/profile.html', 
                title: 'My Profile',
                protected: true 
            },
            '/donations': { 
                template: '/pages/donations.html', 
                title: 'My Donations',
                protected: true 
            },
            '/404': { template: '/pages/404.html', title: 'Page Not Found' }
        };

        this.init();
    }

    init() {
        window.addEventListener('popstate', () => this.handleRoute());
        document.addEventListener('click', (e) => {
            if (e.target.matches('a') && e.target.href.startsWith(window.location.origin)) {
                e.preventDefault();
                const url = new URL(e.target.href);
                this.navigate(url.pathname);
            }
        });

        this.handleRoute();
    }

    async handleRoute() {
        const path = window.location.pathname;
        const route = this.routes[path] || this.routes['/404'];

        if (route.protected && !auth.isAuthenticated()) {
            utils.showNotification('Please login to access this page', 'error');
            this.navigate('/login');
            return;
        }

        // Special handling for register page - force a full page load
        if (path === '/register' && !sessionStorage.getItem('register_page_loaded')) {
            sessionStorage.setItem('register_page_loaded', 'true');
            window.location.href = '/register';
            return;
        }

        try {
            const response = await fetch(route.template);
            const html = await response.text();
            
            document.title = `Blood Donation - ${route.title}`;
            document.getElementById('app').innerHTML = html;

            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.toggle('active', link.pathname === path);
            });

            // Initialize page-specific JavaScript
            if (this.routes[path]?.init) {
                this.routes[path].init();
            }

            // Special post-loading initialization for register page
            if (path === '/register' && typeof app !== 'undefined' && app.initRegisterPage) {
                console.log('Router is manually initializing register page');
                app.initRegisterPage();
            }

        } catch (error) {
            console.error('Error loading page:', error);
            utils.showNotification('Error loading page', 'error');
        }
    }

    navigate(path) {
        // Force a full page load for register
        if (path === '/register') {
            sessionStorage.removeItem('register_page_loaded');
            window.location.href = path;
            return;
        }
        
        window.history.pushState({}, '', path);
        this.handleRoute();
    }
}

const router = new Router();