// Handle event creation
document.getElementById('eventForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!this.checkValidity()) {
        this.classList.add('was-validated');
        return;
    }

    const formData = {
        title: document.querySelector('[name="eventName"]').value,
        description: document.querySelector('[name="description"]').value,
        date: document.querySelector('[name="startDate"]').value,
        location: document.querySelector('[name="venueName"]').value + ', ' + 
                 document.querySelector('[name="address"]').value + ', ' +
                 document.querySelector('[name="city"]').value + ', ' +
                 document.querySelector('[name="state"]').value,
        category: document.querySelector('[name="category"]').value,
        price: parseFloat(document.querySelector('[name="ticketPrice"]').value),
        available_tickets: parseInt(document.querySelector('[name="totalTickets"]').value),
        user_id: 1 // This should be replaced with actual logged-in user ID
    };

    try {
        const response = await fetch('/api/events/create.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        if (result.status) {
            alert('Event created successfully!');
            window.location.href = 'smart-ticketing.html';
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error creating event. Please try again.');
    }
});

// Load events for the smart-ticketing page
async function loadEvents() {
    try {
        const response = await fetch('/api/events/list.php');
        const events = await response.json();
        
        const upcomingEventsContainer = document.getElementById('upcomingEvents');
        if (!upcomingEventsContainer) return;

        upcomingEventsContainer.innerHTML = events.map(event => `
            <div class="col-md-4">
                <div class="card">
                    <img src="https://source.unsplash.com/400x200/?${event.category}" class="card-img-top" alt="${event.title}">
                    <div class="card-body">
                        <h5 class="card-title">${event.title}</h5>
                        <p class="card-text">${event.description}</p>
                        <p class="text-muted">
                            <i class="fas fa-calendar-alt me-2"></i>${new Date(event.date).toLocaleDateString()}
                            <br>
                            <i class="fas fa-map-marker-alt me-2"></i>${event.location}
                            <br>
                            <i class="fas fa-ticket-alt me-2"></i>$${event.price} - ${event.available_tickets} tickets left
                        </p>
                        <button class="btn btn-primary" onclick="purchaseTicket(${event.id})">Buy Tickets</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

// Purchase ticket function
async function purchaseTicket(eventId) {
    const quantity = 1; // You can add a quantity selector in the UI if needed
    
    try {
        const response = await fetch('/api/tickets/purchase.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event_id: eventId,
                user_id: 1, // This should be replaced with actual logged-in user ID
                quantity: quantity
            })
        });

        const result = await response.json();
        
        if (result.status) {
            alert('Ticket purchased successfully!');
            loadEvents(); // Refresh the events list
            loadUserTickets(); // Refresh user's tickets
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error purchasing ticket. Please try again.');
    }
}

// Load user's tickets
async function loadUserTickets() {
    try {
        const response = await fetch('/api/tickets/list.php?user_id=1'); // Replace 1 with actual user ID
        const tickets = await response.json();
        
        const activeTicketsContainer = document.getElementById('activeTickets');
        if (!activeTicketsContainer) return;

        activeTicketsContainer.innerHTML = tickets.map(ticket => `
            <div class="col-md-6">
                <div class="ticket-card p-4 position-relative">
                    <span class="ticket-status status-valid">Valid</span>
                    <div class="row">
                        <div class="col-md-8">
                            <h4>${ticket.event_title}</h4>
                            <div class="ticket-details">
                                <p class="mb-1"><i class="fas fa-calendar-alt me-2"></i>${new Date(ticket.event_date).toLocaleDateString()}</p>
                                <p class="mb-1"><i class="fas fa-map-marker-alt me-2"></i>${ticket.event_location}</p>
                                <p class="mb-1"><i class="fas fa-ticket-alt me-2"></i>Quantity: ${ticket.quantity}</p>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="qr-code d-flex align-items-center justify-content-center">
                                <i class="fas fa-qrcode fa-5x text-primary"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading tickets:', error);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
    loadUserTickets();
});
