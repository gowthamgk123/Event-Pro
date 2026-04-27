// Event filtering functionality
function filterEvents(category) {
    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    // Update active state of filter buttons
    const buttons = document.querySelectorAll('.btn-outline-primary');
    buttons.forEach(button => {
        if (button.textContent.toLowerCase().includes(category)) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Load events from localStorage
function loadEvents() {
    const eventsList = document.getElementById('eventsList');
    if (!eventsList) return;

    const events = JSON.parse(localStorage.getItem('events')) || [];
    
    // Clear existing events
    eventsList.innerHTML = '';
    
    if (events.length === 0) {
        eventsList.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted">No events found. <a href="createEvent.html">Create an event</a> to get started!</p>
            </div>
        `;
        return;
    }

    // Sort events by date
    events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    events.forEach(event => {
        const eventCard = createEventCard(event);
        eventsList.appendChild(eventCard);
    });
}

// Create event card element
function createEventCard(event) {
    const div = document.createElement('div');
    div.className = 'col-md-6 col-lg-4 event-card';
    div.dataset.category = event.category?.toLowerCase() || 'other';

    const eventDate = new Date(event.startDate);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    div.innerHTML = `
        <div class="card h-100 border-0 shadow-sm">
            ${event.bannerImage ? `<img src="${event.bannerImage}" class="card-img-top" alt="${event.eventName}">` : 
            '<div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height: 200px;">'+
            '<i class="fas fa-calendar-alt fa-3x text-muted"></i></div>'}
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="badge ${getBadgeClass(event.category)}">${event.category || 'Other'}</span>
                    <div>
                        <small class="text-muted">
                            <i class="fas fa-ticket-alt me-2"></i>${event.totalTickets} tickets left
                        </small>
                        <button class="btn btn-sm btn-danger ms-2" onclick="removeEvent('${event.eventName}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <h5 class="card-title">${event.eventName}</h5>
                <p class="card-text">${event.description || ''}</p>
                <div class="event-details mb-3">
                    <p class="mb-1"><i class="fas fa-calendar-alt me-2"></i>${formattedDate}</p>
                    <p class="mb-1"><i class="fas fa-clock me-2"></i>${event.startTime || 'TBA'}</p>
                    <p class="mb-1"><i class="fas fa-map-marker-alt me-2"></i>${event.venueName}, ${event.city}</p>
                    ${event.isVirtual ? '<p class="mb-1"><i class="fas fa-video me-2"></i>Virtual Event</p>' : ''}
                </div>
                <a href="smart-ticketing.html?event=${encodeURIComponent(event.eventName)}" 
                   class="btn btn-primary w-100 rounded-pill">Get Tickets</a>
            </div>
        </div>
    `;

    return div;
}

// Remove event function
function removeEvent(eventName) {
    if (confirm(`Are you sure you want to remove "${eventName}"?`)) {
        let events = JSON.parse(localStorage.getItem('events') || '[]');
        events = events.filter(event => event.eventName !== eventName);
        localStorage.setItem('events', JSON.stringify(events));
        
        // Show success message
        showToast('Event removed successfully');
        
        // Refresh the events list
        loadEvents();
    }
}

// Show toast message
function showToast(message) {
    const toastContainer = document.createElement('div');
    toastContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
    `;
    
    const toast = document.createElement('div');
    toast.className = 'alert alert-success alert-dismissible fade show';
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

// Helper function to get appropriate badge class based on category
function getBadgeClass(category) {
    const classes = {
        'tech': 'bg-primary',
        'sports': 'bg-info',
        'music': 'bg-success',
        'business': 'bg-warning text-dark'
    };
    return classes[category?.toLowerCase()] || 'bg-secondary';
}

// Save event function
function saveEvent(eventData) {
    try {
        // Get existing events or initialize empty array
        let events = JSON.parse(localStorage.getItem('events') || '[]');
        
        // Check for duplicate event names
        if (events.some(event => event.eventName === eventData.eventName)) {
            throw new Error('An event with this name already exists');
        }
        
        // Add required fields if not present
        eventData.category = eventData.category || 'Other';
        eventData.totalTickets = parseInt(eventData.totalTickets) || 100;
        
        // Add the new event
        events.push(eventData);
        
        // Save back to localStorage
        localStorage.setItem('events', JSON.stringify(events));
        
        // Show success message
        showToast('Event created successfully!');
        
        // Redirect to events page after short delay
        setTimeout(() => {
            window.location.href = 'index.html#events';
        }, 1500);
    } catch (error) {
        console.error('Error saving event:', error);
        showToast('Error creating event: ' + error.message);
    }
}

// Initialize events on page load
document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
});