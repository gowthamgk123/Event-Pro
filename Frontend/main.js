// API handling functions
async function loadFeaturedEvents() {
    try {
        const response = await fetch('/api/events/list.php');
        const events = await response.json();
        
        const featuredEventsContainer = document.getElementById('featuredEvents');
        if (!featuredEventsContainer) return;

        featuredEventsContainer.innerHTML = events.map(event => `
            <div class="col-md-6 col-lg-4 event-card" data-category="${event.category}">
                <div class="card h-100 border-0 shadow-sm">
                    <img src="https://source.unsplash.com/600x400/?${event.category}" class="card-img-top" alt="${event.title}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-primary">${event.category}</span>
                            <small class="text-muted">
                                <i class="fas fa-ticket-alt me-2"></i>${event.available_tickets} tickets left
                            </small>
                        </div>
                        <h5 class="card-title">${event.title}</h5>
                        <p class="card-text">${event.description}</p>
                        <div class="event-details mb-3">
                            <p class="mb-1"><i class="fas fa-calendar-alt me-2"></i>${formatDate(event.date)}</p>
                            <p class="mb-1"><i class="fas fa-map-marker-alt me-2"></i>${event.location}</p>
                            <p class="mb-1"><i class="fas fa-tag me-2"></i>$${event.price}</p>
                        </div>
                        <a href="smart-ticketing.html?event=${event.id}" class="btn btn-primary w-100">Get Tickets</a>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

// Auth handling functions
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        
        showToast('Login successful!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } catch (error) {
        showToast('Error logging in. Please try again.', 'error');
    }
}

async function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName')?.value;
    const email = document.getElementById('signupEmail')?.value;
    const password = document.getElementById('signupPassword')?.value;

    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push({ name, email });
        localStorage.setItem('users', JSON.stringify(users));
        
        showToast('Registration successful! Please login.', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    } catch (error) {
        showToast('Error registering. Please try again.', 'error');
    }
}

// Event form handling
function handleEventSubmission(event) {
    event.preventDefault();

    const form = event.target;
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const formData = new FormData(form);
    const eventData = {};
    formData.forEach((value, key) => {
        eventData[key] = value;
    });

    const fileInput = form.querySelector('input[type="file"]');
    if (fileInput?.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            eventData.bannerImage = e.target.result;
            saveEvent(eventData);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        saveEvent(eventData);
    }
}

// File handling
function previewImage(event) {
    const preview = document.getElementById('imagePreview');
    const file = event.target.files[0];
    
    if (file && preview) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" class="img-fluid" alt="Event banner preview">`;
        }
        reader.readAsDataURL(file);
    } else if (preview) {
        preview.innerHTML = '';
    }
}

// Utility functions
function showToast(message, type = 'success') {
    const toastContainer = document.createElement('div');
    toastContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
    `;
    
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show`;
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    toastContainer.appendChild(toast);
    document.body.appendChild(toastContainer);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toastContainer.remove(), 300);
    }, 3000);
}

function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Initialize page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedEvents();
    
    // Set up form listeners
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', handleEventSubmission);
    }

    // Handle file preview
    const imageInput = document.querySelector('input[type="file"]');
    if (imageInput) {
        imageInput.addEventListener('change', previewImage);
    }

    // Set up filter buttons
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.filter;
            filterEvents(category);
            
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
});
