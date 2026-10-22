/* ============================================
   PET RESCUE & ADOPTION WEBSITE - JAVASCRIPT
   All logic: localStorage, forms, admin, etc.
   ============================================ */

// ==========================================
//  DATA MANAGEMENT (localStorage helpers)
// ==========================================

/** Retrieve an array from localStorage by key */
function getData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

/** Save an array to localStorage by key */
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/** Generate a simple unique ID */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// ==========================================
//  SAMPLE DATA — pre-populated on first load
// ==========================================

function initSampleData() {
  // Only seed once
  if (localStorage.getItem('pr_initialized')) return;

  const samplePets = [
    {
      id: generateId(),
      photo: 'images/dog_golden.jpg',
      name: 'Buddy',
      animalType: 'Dog',
      breed: 'Golden Retriever',
      age: '2 years',
      gender: 'Male',
      location: 'Bangalore, MG Road',
      dateFound: '2026-09-25',
      condition: 'Healthy',
      description: 'A friendly and energetic golden retriever found wandering near MG Road. Very well-behaved and loves human companionship. Appears to have been a family pet.',
      finderName: 'Rahul Sharma',
      finderPhone: '9876543210',
      finderEmail: 'rahul@example.com',
      status: 'available',   // pending | available | adopted
      submittedDate: '2026-09-25T10:30:00',
      approvedDate: '2026-09-26T14:00:00'
    },
    {
      id: generateId(),
      photo: 'images/cat_tabby.jpg',
      name: 'Whiskers',
      animalType: 'Cat',
      breed: 'Tabby',
      age: '1 year',
      gender: 'Female',
      location: 'Mumbai, Andheri West',
      dateFound: '2026-09-28',
      condition: 'Healthy',
      description: 'A beautiful tabby cat with striking green eyes. Found sheltering under a parked car during the rain. Calm temperament, good with people.',
      finderName: 'Priya Patel',
      finderPhone: '9123456789',
      finderEmail: 'priya@example.com',
      status: 'available',
      submittedDate: '2026-09-28T08:15:00',
      approvedDate: '2026-09-29T11:00:00'
    }
  ];

  saveData('pr_pets', samplePets);
  saveData('pr_adoptionRequests', []);
  localStorage.setItem('pr_initialized', 'true');
}

// ==========================================
//  NAVIGATION
// ==========================================

/** Show a specific page section, hide the rest */
function navigateTo(sectionId) {
  // Hide all sections
  document.querySelectorAll('.page-view').forEach(el => el.classList.add('hidden'));
  // Show the target
  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  // Update active nav link based on section
  const navMap = {
    'project-view': 0,
    'home-view': 1,
    'rescue-view': 2,
    'pets-view': 3,
    'how-view': 4,
    'about-view': 5,
    'contact-view': 6
  };
  const links = document.querySelectorAll('.nav-links a:not(.nav-admin-link)');
  links.forEach(a => a.classList.remove('active'));
  const idx = navMap[sectionId];
  if (idx !== undefined && links[idx]) {
    links[idx].classList.add('active');
  }
  // Close mobile nav
  document.querySelector('.nav-links')?.classList.remove('open');
  document.querySelector('.nav-toggle')?.classList.remove('active');
}

/** Scroll-aware navbar styling */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Mobile toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  toggle?.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('open');
  });
}

// ==========================================
//  TOAST NOTIFICATIONS
// ==========================================

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '📢'}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// ==========================================
//  CONFIRM DIALOG
// ==========================================

function showConfirm(title, message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = `
    <div class="confirm-dialog">
      <div class="confirm-icon">⚠️</div>
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="confirm-actions">
        <button class="btn btn-secondary btn-sm" id="confirm-cancel">Cancel</button>
        <button class="btn btn-danger btn-sm" id="confirm-ok">Confirm</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('#confirm-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#confirm-ok').addEventListener('click', () => { onConfirm(); overlay.remove(); });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

// ==========================================
//  IMAGE HANDLING — convert File to base64
// ==========================================

function readImageAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ==========================================
//  FORM VALIDATION HELPERS
// ==========================================

/** Validate a single field, show/hide error message */
function validateField(input, errorEl, message) {
  if (!input.value.trim()) {
    input.classList.add('error');
    if (errorEl) { errorEl.textContent = message; errorEl.classList.add('show'); }
    return false;
  }
  input.classList.remove('error');
  if (errorEl) { errorEl.classList.remove('show'); }
  return true;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[\d\s\-+()]{7,15}$/.test(phone);
}

/** Clear all errors in a form */
function clearFormErrors(form) {
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  form.querySelectorAll('.form-error').forEach(el => el.classList.remove('show'));
}

// ==========================================
//  RESCUE REPORT FORM
// ==========================================

let rescuePhotoData = null;   // base64 string of the uploaded photo

function initRescueForm() {
  const form = document.getElementById('rescue-form');
  const photoUpload = document.getElementById('photo-upload-area');
  const photoInput = document.getElementById('pet-photo-input');
  const photoPreview = document.getElementById('photo-preview');
  const photoPlaceholder = document.getElementById('photo-placeholder');

  // Click to upload
  photoUpload?.addEventListener('click', () => photoInput.click());

  // File selection handler
  photoInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be smaller than 5 MB.', 'error');
      return;
    }
    rescuePhotoData = await readImageAsBase64(file);
    photoPreview.src = rescuePhotoData;
    photoPreview.classList.remove('hidden');
    photoPlaceholder.classList.add('hidden');
    photoUpload.classList.add('has-image');
  });

  // Submit
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleRescueSubmit(form);
  });
}

function handleRescueSubmit(form) {
  clearFormErrors(form);
  let valid = true;

  // Required fields: animalType, age, gender, location, dateFound, condition, description, finderName, finderPhone, finderEmail
  const fields = [
    { id: 'rescue-animal-type', msg: 'Please select an animal type.' },
    { id: 'rescue-location', msg: 'Please enter the location where the pet was found.' },
    { id: 'rescue-date', msg: 'Please select the date found.' },
    { id: 'rescue-condition', msg: 'Please select the pet condition.' },
    { id: 'rescue-description', msg: 'Please provide a brief description.' },
    { id: 'rescue-finder-name', msg: 'Please enter your name.' },
    { id: 'rescue-finder-phone', msg: 'Please enter your phone number.' },
    { id: 'rescue-finder-email', msg: 'Please enter your email address.' }
  ];

  fields.forEach(f => {
    const input = document.getElementById(f.id);
    const error = document.getElementById(f.id + '-error');
    if (!validateField(input, error, f.msg)) valid = false;
  });

  // Email format
  const emailInput = document.getElementById('rescue-finder-email');
  if (emailInput.value && !validateEmail(emailInput.value)) {
    emailInput.classList.add('error');
    const err = document.getElementById('rescue-finder-email-error');
    if (err) { err.textContent = 'Please enter a valid email.'; err.classList.add('show'); }
    valid = false;
  }

  // Phone format
  const phoneInput = document.getElementById('rescue-finder-phone');
  if (phoneInput.value && !validatePhone(phoneInput.value)) {
    phoneInput.classList.add('error');
    const err = document.getElementById('rescue-finder-phone-error');
    if (err) { err.textContent = 'Please enter a valid phone number.'; err.classList.add('show'); }
    valid = false;
  }

  // Photo is recommended but optional
  if (!rescuePhotoData) {
    // We'll allow submission without photo — use a placeholder
  }

  if (!valid) {
    showToast('Please fix the errors in the form.', 'error');
    return;
  }

  // Build pet object
  const pet = {
    id: generateId(),
    photo: rescuePhotoData || '',
    name: 'Unnamed',
    animalType: document.getElementById('rescue-animal-type').value,
    breed: document.getElementById('rescue-breed').value.trim() || 'Unknown',
    age: 'Unknown',
    gender: 'Unknown',
    location: document.getElementById('rescue-location').value.trim(),
    dateFound: document.getElementById('rescue-date').value,
    condition: document.getElementById('rescue-condition').value,
    description: document.getElementById('rescue-description').value.trim(),
    finderName: document.getElementById('rescue-finder-name').value.trim(),
    finderPhone: document.getElementById('rescue-finder-phone').value.trim(),
    finderEmail: document.getElementById('rescue-finder-email').value.trim(),
    status: 'pending',
    submittedDate: new Date().toISOString(),
    approvedDate: null
  };

  // Store in localStorage
  const pets = getData('pr_pets');
  pets.push(pet);
  saveData('pr_pets', pets);

  // Reset form
  form.reset();
  rescuePhotoData = null;
  document.getElementById('photo-preview')?.classList.add('hidden');
  document.getElementById('photo-placeholder')?.classList.remove('hidden');
  document.getElementById('photo-upload-area')?.classList.remove('has-image');

  showToast('Thank you! The pet rescue report has been submitted successfully.', 'success');

  // Refresh admin if open
  renderAdminPending();
  updateAdminStats();
}

// ==========================================
//  AVAILABLE PETS — rendering & filtering
// ==========================================

function getAvailablePets() {
  return getData('pr_pets').filter(p => p.status === 'available' || p.status === 'processing');
}

function renderAvailablePets(pets) {
  const grid = document.getElementById('pets-grid');
  if (!grid) return;

  if (!pets) pets = getFilteredPets();

  grid.innerHTML = '';

  if (pets.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <div class="emoji">🐾</div>
        <h3>No pets found</h3>
        <p>Try changing your search filters or check back later.</p>
      </div>
    `;
    return;
  }

  pets.forEach((pet, i) => {
    const card = document.createElement('div');
    card.className = 'pet-card';
    card.style.animationDelay = `${i * 0.1}s`;

    const condBadgeClass = `badge-${pet.condition.toLowerCase()}`;
    const typeEmoji = getAnimalEmoji(pet.animalType);
    const photoSrc = pet.photo || getPlaceholderImage(pet.animalType);
    const isProcessing = pet.status === 'processing';

    // Show different button when adoption is in process
    const adoptButton = isProcessing
      ? `<button class="btn btn-sm" style="background:#f39c12;color:#fff;cursor:not-allowed;opacity:0.85;" disabled>⏳ Adoption In Process</button>`
      : `<button class="btn btn-primary btn-sm" onclick="openAdoptionForm('${pet.id}')">I Want to Adopt</button>`;

    card.innerHTML = `
      <div class="pet-card-image">
        <img src="${photoSrc}" alt="${pet.name}" loading="lazy">
        ${isProcessing
          ? '<span class="pet-card-badge" style="background:#f39c12;">Adoption In Process</span>'
          : `<span class="pet-card-badge ${condBadgeClass}">${pet.condition}</span>`
        }
        <span class="pet-card-type-badge">${typeEmoji}</span>
      </div>
      <div class="pet-card-body">
        <h3 class="pet-card-name">${pet.name}</h3>
        <div class="pet-card-meta">
          <span class="pet-meta-tag">🐾 ${pet.animalType}</span>
          <span class="pet-meta-tag">📍 ${shortenLocation(pet.location)}</span>
          <span class="pet-meta-tag">${pet.gender === 'Male' ? '♂️' : '♀️'} ${pet.gender}</span>
          <span class="pet-meta-tag">🎂 ${pet.age}</span>
        </div>
        <p class="pet-card-desc">${pet.description}</p>
        <div class="pet-card-actions">
          <button class="btn btn-secondary btn-sm" onclick="openPetDetail('${pet.id}')">View Details</button>
          ${adoptButton}
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

function getAnimalEmoji(type) {
  const map = { Dog: '🐕', Cat: '🐈', Rabbit: '🐇', Bird: '🐦', Other: '🐾' };
  return map[type] || '🐾';
}

function getPlaceholderImage(type) {
  // SVG placeholder fallback
  const colors = { Dog: '#e8722a', Cat: '#4caf7d', Rabbit: '#9b59b6', Bird: '#3498db', Other: '#95a5a6' };
  const color = colors[type] || '#95a5a6';
  const emoji = getAnimalEmoji(type);
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect fill='${color}20' width='400' height='300'/><text x='200' y='160' text-anchor='middle' font-size='80'>${emoji}</text></svg>`)}`;
}

function shortenLocation(loc) {
  if (!loc) return '';
  const parts = loc.split(',');
  return parts[0].trim();
}

// ==========================================
//  SEARCH & FILTER
// ==========================================

function getFilteredPets() {
  let pets = getAvailablePets();

  const typeFilter = document.getElementById('filter-type')?.value;
  const genderFilter = document.getElementById('filter-gender')?.value;
  const conditionFilter = document.getElementById('filter-condition')?.value;
  const searchText = document.getElementById('filter-search')?.value?.toLowerCase().trim();

  if (typeFilter) pets = pets.filter(p => p.animalType === typeFilter);
  if (genderFilter) pets = pets.filter(p => p.gender === genderFilter);
  if (conditionFilter) pets = pets.filter(p => p.condition === conditionFilter);

  if (searchText) {
    pets = pets.filter(p =>
      p.name.toLowerCase().includes(searchText) ||
      p.animalType.toLowerCase().includes(searchText) ||
      p.breed.toLowerCase().includes(searchText) ||
      p.location.toLowerCase().includes(searchText) ||
      p.age.toLowerCase().includes(searchText) ||
      p.description.toLowerCase().includes(searchText)
    );
  }

  return pets;
}

function applyFilters() {
  renderAvailablePets(getFilteredPets());
}

function clearFilters() {
  document.getElementById('filter-type').value = '';
  document.getElementById('filter-gender').value = '';
  document.getElementById('filter-condition').value = '';
  document.getElementById('filter-search').value = '';
  applyFilters();
}

function initFilters() {
  ['filter-type', 'filter-gender', 'filter-condition'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', applyFilters);
  });
  document.getElementById('filter-search')?.addEventListener('input', applyFilters);
}

// ==========================================
//  PET DETAIL MODAL
// ==========================================

function openPetDetail(petId) {
  const pets = getData('pr_pets');
  const pet = pets.find(p => p.id === petId);
  if (!pet) return;

  const photoSrc = pet.photo || getPlaceholderImage(pet.animalType);

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'pet-detail-modal';
  overlay.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" onclick="closeModal('pet-detail-modal')">✕</button>
      <img class="modal-pet-image" src="${photoSrc}" alt="${pet.name}">
      <div class="modal-pet-body">
        <h2 class="modal-pet-name">${pet.name}</h2>
        <div class="modal-pet-details">
          <div class="detail-item">
            <span class="detail-icon">🐾</span>
            <div class="detail-info">
              <span class="detail-label">Animal Type</span>
              <span class="detail-value">${pet.animalType}</span>
            </div>
          </div>
          <div class="detail-item">
            <span class="detail-icon">🏷️</span>
            <div class="detail-info">
              <span class="detail-label">Breed</span>
              <span class="detail-value">${pet.breed}</span>
            </div>
          </div>
          <div class="detail-item">
            <span class="detail-icon">🎂</span>
            <div class="detail-info">
              <span class="detail-label">Age</span>
              <span class="detail-value">${pet.age}</span>
            </div>
          </div>
          <div class="detail-item">
            <span class="detail-icon">${pet.gender === 'Male' ? '♂️' : '♀️'}</span>
            <div class="detail-info">
              <span class="detail-label">Gender</span>
              <span class="detail-value">${pet.gender}</span>
            </div>
          </div>
          <div class="detail-item">
            <span class="detail-icon">📍</span>
            <div class="detail-info">
              <span class="detail-label">Location</span>
              <span class="detail-value">${pet.location}</span>
            </div>
          </div>
          <div class="detail-item">
            <span class="detail-icon">💚</span>
            <div class="detail-info">
              <span class="detail-label">Condition</span>
              <span class="detail-value">${pet.condition}</span>
            </div>
          </div>
        </div>

        <div class="modal-description">
          <h4>About ${pet.name}</h4>
          <p>${pet.description}</p>
        </div>

        <div class="modal-rescue-info">
          <h4>Rescue Information</h4>
          <p><strong>Found on:</strong> ${formatDate(pet.dateFound)}</p>
          <p><strong>Reported by:</strong> ${pet.finderName}</p>
          <p><strong>Approved on:</strong> ${pet.approvedDate ? formatDate(pet.approvedDate) : 'N/A'}</p>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeModal('pet-detail-modal')">Close</button>
          <button class="btn btn-primary" onclick="closeModal('pet-detail-modal'); openAdoptionForm('${pet.id}')">
            🐾 I Want to Adopt This Pet
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal('pet-detail-modal');
  });
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.remove();
  // Only restore scrolling if no other modals remain
  if (!document.querySelector('.modal-overlay')) {
    document.body.style.overflow = '';
  }
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ==========================================
//  ADOPTION REQUEST FORM
// ==========================================

function openAdoptionForm(petId) {
  const pets = getData('pr_pets');
  const pet = pets.find(p => p.id === petId);
  if (!pet) return;

  // Block if adoption is already in process
  if (pet.status === 'processing') {
    showToast('This pet already has an adoption request in process. Please check back later.', 'info');
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay adoption-form-modal';
  overlay.id = 'adoption-form-modal';
  overlay.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" onclick="closeModal('adoption-form-modal')">✕</button>
      <div class="modal-pet-body">
        <div class="form-header">
          <h2>🐾 Adopt ${pet.name}</h2>
          <p>Fill in your details to submit an adoption request for <strong>${pet.name}</strong>.</p>
        </div>
        <form id="adoption-request-form" class="form-grid" onsubmit="handleAdoptionSubmit(event, '${pet.id}')">
          <div class="form-group">
            <label>Full Name <span class="required">*</span></label>
            <input type="text" id="adopt-name" placeholder="Your full name">
            <span class="form-error" id="adopt-name-error"></span>
          </div>
          <div class="form-group">
            <label>Age <span class="required">*</span></label>
            <input type="number" id="adopt-age" placeholder="Your age" min="18" max="99">
            <span class="form-error" id="adopt-age-error"></span>
          </div>
          <div class="form-group">
            <label>Phone Number <span class="required">*</span></label>
            <input type="tel" id="adopt-phone" placeholder="Your phone number">
            <span class="form-error" id="adopt-phone-error"></span>
          </div>
          <div class="form-group">
            <label>Email <span class="required">*</span></label>
            <input type="email" id="adopt-email" placeholder="your@email.com">
            <span class="form-error" id="adopt-email-error"></span>
          </div>
          <div class="form-group full-width">
            <label>Address <span class="required">*</span></label>
            <textarea id="adopt-address" rows="2" placeholder="Your full address"></textarea>
            <span class="form-error" id="adopt-address-error"></span>
          </div>
          <div class="form-group full-width">
            <label>Previous Experience with Pets</label>
            <textarea id="adopt-experience" rows="2" placeholder="Describe any previous experience with pets (optional)"></textarea>
          </div>
          <div class="form-group full-width">
            <label>Reason for Adoption <span class="required">*</span></label>
            <textarea id="adopt-reason" rows="3" placeholder="Why do you want to adopt this pet?"></textarea>
            <span class="form-error" id="adopt-reason-error"></span>
          </div>
          <div class="form-group">
            <label>Preferred Contact Method</label>
            <select id="adopt-contact-method">
              <option value="Phone">Phone</option>
              <option value="Email">Email</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
          </div>
          <div class="form-submit" style="grid-column: 1/-1;">
            <button type="submit" class="btn btn-primary btn-lg">🐾 Submit Adoption Request</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal('adoption-form-modal');
  });
}

function handleAdoptionSubmit(e, petId) {
  e.preventDefault();
  const form = document.getElementById('adoption-request-form');
  clearFormErrors(form);
  let valid = true;

  const fields = [
    { id: 'adopt-name', msg: 'Please enter your full name.' },
    { id: 'adopt-age', msg: 'Please enter your age.' },
    { id: 'adopt-phone', msg: 'Please enter your phone number.' },
    { id: 'adopt-email', msg: 'Please enter your email.' },
    { id: 'adopt-address', msg: 'Please enter your address.' },
    { id: 'adopt-reason', msg: 'Please provide a reason for adoption.' }
  ];

  fields.forEach(f => {
    const input = document.getElementById(f.id);
    const error = document.getElementById(f.id + '-error');
    if (!validateField(input, error, f.msg)) valid = false;
  });

  const emailInput = document.getElementById('adopt-email');
  if (emailInput.value && !validateEmail(emailInput.value)) {
    emailInput.classList.add('error');
    const err = document.getElementById('adopt-email-error');
    if (err) { err.textContent = 'Please enter a valid email.'; err.classList.add('show'); }
    valid = false;
  }

  const phoneInput = document.getElementById('adopt-phone');
  if (phoneInput.value && !validatePhone(phoneInput.value)) {
    phoneInput.classList.add('error');
    const err = document.getElementById('adopt-phone-error');
    if (err) { err.textContent = 'Please enter a valid phone number.'; err.classList.add('show'); }
    valid = false;
  }

  if (!valid) {
    showToast('Please fix the errors in the form.', 'error');
    return;
  }

  // Get pet info
  const pets = getData('pr_pets');
  const pet = pets.find(p => p.id === petId);

  const request = {
    id: generateId(),
    petId: petId,
    petName: pet ? pet.name : 'Unknown',
    petAnimalType: pet ? pet.animalType : '',
    applicantName: document.getElementById('adopt-name').value.trim(),
    applicantAge: document.getElementById('adopt-age').value.trim(),
    applicantPhone: document.getElementById('adopt-phone').value.trim(),
    applicantEmail: document.getElementById('adopt-email').value.trim(),
    applicantAddress: document.getElementById('adopt-address').value.trim(),
    experience: document.getElementById('adopt-experience').value.trim(),
    reason: document.getElementById('adopt-reason').value.trim(),
    contactMethod: document.getElementById('adopt-contact-method').value,
    status: 'pending',    // pending | accepted | rejected
    requestDate: new Date().toISOString()
  };

  const requests = getData('pr_adoptionRequests');
  requests.push(request);
  saveData('pr_adoptionRequests', requests);

  // Mark pet as 'processing' — blocks further adoption requests until admin decides
  const petIdx = pets.findIndex(p => p.id === petId);
  if (petIdx !== -1) {
    pets[petIdx].status = 'processing';
    saveData('pr_pets', pets);
  }

  closeModal('adoption-form-modal');
  showToast('Your adoption request has been submitted successfully. The pet rescue team will contact you soon.', 'success');

  // Refresh available pets and admin views
  renderAvailablePets();
  renderAdminAdoptions();
  updateAdminStats();
  updateHeroStats();
}

// ==========================================
//  ADMIN DASHBOARD
// ==========================================

let adminAuthenticated = false;

function openAdmin() {
  navigateTo('admin-view');
  if (!adminAuthenticated) {
    showAdminLogin();
  } else {
    renderAdminDashboard();
  }
}

function showAdminLogin() {
  // Remove existing login overlay if any
  document.getElementById('admin-login-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'admin-login-overlay';
  overlay.id = 'admin-login-overlay';
  overlay.innerHTML = `
    <div class="admin-login-box">
      <h2>🔐 Admin Access</h2>
      <p>Enter the admin password to access the dashboard.</p>
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="admin-password" placeholder="Enter password" value="">
        <span class="form-error" id="admin-password-error"></span>
      </div>
      <button class="btn btn-primary" onclick="attemptAdminLogin()">Login</button>
      <button class="btn btn-secondary" onclick="document.getElementById('admin-login-overlay').remove(); navigateTo('home-view')" style="margin-top:8px;">Cancel</button>
    </div>
  `;
  document.body.appendChild(overlay);

  // Enter key submits
  document.getElementById('admin-password')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') attemptAdminLogin();
  });
  document.getElementById('admin-password')?.focus();
}

function attemptAdminLogin() {
  const pw = document.getElementById('admin-password')?.value;
  if (pw === 'admin123') {
    adminAuthenticated = true;
    document.getElementById('admin-login-overlay')?.remove();
    showToast('Welcome, Admin! You are now logged in.', 'success');
    renderAdminDashboard();
  } else {
    const err = document.getElementById('admin-password-error');
    if (err) { err.textContent = 'Incorrect password.'; err.classList.add('show'); }
    showToast('Incorrect admin password.', 'error');
  }
}

function renderAdminDashboard() {
  updateAdminStats();
  renderAdminPending();
  renderAdminAdoptions();
  initAdminTabs();
}

function updateAdminStats() {
  const pets = getData('pr_pets');
  const requests = getData('pr_adoptionRequests');

  const pending = pets.filter(p => p.status === 'pending').length;
  const available = pets.filter(p => p.status === 'available').length;
  const adopted = pets.filter(p => p.status === 'adopted').length;
  const adoptionReqs = requests.filter(r => r.status === 'pending').length;

  const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  el('stat-pending', pending);
  el('stat-available', available);
  el('stat-adopted', adopted);
  el('stat-requests', adoptionReqs);

  // Also update tab counts
  el('tab-count-pending', pending);
  el('tab-count-adoptions', adoptionReqs);
}

function initAdminTabs() {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById(tab.dataset.panel);
      if (panel) panel.classList.add('active');
    });
  });
}

// -------- Pending Reports --------

function renderAdminPending() {
  const container = document.getElementById('pending-reports-list');
  if (!container) return;

  const pending = getData('pr_pets').filter(p => p.status === 'pending');
  updateAdminStats();

  if (pending.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <h3>No Pending Reports</h3>
        <p>All rescue reports have been reviewed. Check back later for new submissions.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = pending.map(pet => {
    const photoSrc = pet.photo || getPlaceholderImage(pet.animalType);
    return `
      <div class="admin-card" id="admin-card-${pet.id}">
        <img class="admin-card-image" src="${photoSrc}" alt="${pet.name}">
        <div class="admin-card-info">
          <h3>${getAnimalEmoji(pet.animalType)} ${pet.name} — ${pet.animalType}</h3>
          <div class="admin-card-details">
            <span><strong>Breed:</strong> ${pet.breed}</span>
            <span><strong>Age:</strong> ${pet.age}</span>
            <span><strong>Gender:</strong> ${pet.gender}</span>
            <span><strong>Condition:</strong> ${pet.condition}</span>
            <span><strong>Location:</strong> ${pet.location}</span>
            <span><strong>Date Found:</strong> ${formatDate(pet.dateFound)}</span>
          </div>
          <p class="admin-card-desc">${pet.description}</p>
          <div class="admin-card-finder">
            <strong>Finder:</strong> ${pet.finderName} &nbsp;|&nbsp;
            <strong>Phone:</strong> ${pet.finderPhone} &nbsp;|&nbsp;
            <strong>Email:</strong> ${pet.finderEmail}<br>
            <strong>Submitted:</strong> ${formatDate(pet.submittedDate)}
          </div>
        </div>
        <div class="admin-card-actions">
          <button class="btn btn-success btn-sm" onclick="approvePet('${pet.id}')">✅ Approve for Adoption</button>
          <button class="btn btn-danger btn-sm" onclick="rejectPet('${pet.id}')">❌ Reject</button>
        </div>
      </div>
    `;
  }).join('');
}

function approvePet(petId) {
  const pets = getData('pr_pets');
  const idx = pets.findIndex(p => p.id === petId);
  if (idx === -1) return;
  pets[idx].status = 'available';
  pets[idx].approvedDate = new Date().toISOString();
  saveData('pr_pets', pets);
  showToast(`${pets[idx].name} has been approved and is now available for adoption!`, 'success');
  renderAdminPending();
  renderAvailablePets();
  updateAdminStats();
}

function rejectPet(petId) {
  showConfirm(
    'Reject Report',
    'Are you sure you want to reject this rescue report? This action cannot be undone.',
    () => {
      const pets = getData('pr_pets');
      const filtered = pets.filter(p => p.id !== petId);
      saveData('pr_pets', filtered);
      showToast('The rescue report has been rejected and removed.', 'info');
      renderAdminPending();
      updateAdminStats();
    }
  );
}

// -------- Adoption Requests --------

function renderAdminAdoptions() {
  const container = document.getElementById('adoption-requests-list');
  if (!container) return;

  const requests = getData('pr_adoptionRequests').filter(r => r.status === 'pending');
  updateAdminStats();

  if (requests.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <h3>No Pending Adoption Requests</h3>
        <p>There are no adoption requests to review at this time.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = requests.map(req => `
    <div class="adoption-request-card" id="adoption-req-${req.id}">
      <div>
        <h3>🐾 Adoption Request for ${req.petName} (${req.petAnimalType})</h3>
        <div class="adoption-request-details">
          <span><strong>Applicant:</strong> ${req.applicantName}</span>
          <span><strong>Age:</strong> ${req.applicantAge}</span>
          <span><strong>Phone:</strong> ${req.applicantPhone}</span>
          <span><strong>Email:</strong> ${req.applicantEmail}</span>
          <span><strong>Address:</strong> ${req.applicantAddress}</span>
          <span><strong>Preferred Contact:</strong> ${req.contactMethod}</span>
          <span><strong>Request Date:</strong> ${formatDate(req.requestDate)}</span>
          <span><strong>Experience:</strong> ${req.experience || 'None mentioned'}</span>
        </div>
        <div class="adoption-request-reason">
          <strong>Reason for Adoption:</strong> ${req.reason}
        </div>
      </div>
      <div class="admin-card-actions">
        <button class="btn btn-success btn-sm" onclick="acceptAdoption('${req.id}')">✅ Accept</button>
        <button class="btn btn-danger btn-sm" onclick="rejectAdoption('${req.id}')">❌ Reject</button>
      </div>
    </div>
  `).join('');
}

function acceptAdoption(reqId) {
  const requests = getData('pr_adoptionRequests');
  const reqIdx = requests.findIndex(r => r.id === reqId);
  if (reqIdx === -1) return;

  const req = requests[reqIdx];
  req.status = 'accepted';
  saveData('pr_adoptionRequests', requests);

  // Mark pet as adopted
  const pets = getData('pr_pets');
  const petIdx = pets.findIndex(p => p.id === req.petId);
  if (petIdx !== -1) {
    pets[petIdx].status = 'adopted';
    saveData('pr_pets', pets);
  }

  showToast(`Adoption request accepted! ${req.petName} is now marked as adopted.`, 'success');
  renderAdminAdoptions();
  renderAvailablePets();
  updateAdminStats();
}

function rejectAdoption(reqId) {
  showConfirm(
    'Reject Adoption Request',
    'Are you sure you want to reject this adoption request? The pet will become available for others to adopt.',
    () => {
      const requests = getData('pr_adoptionRequests');
      const reqIdx = requests.findIndex(r => r.id === reqId);
      if (reqIdx !== -1) {
        // Set pet back to 'available' so others can adopt
        const pets = getData('pr_pets');
        const petIdx = pets.findIndex(p => p.id === requests[reqIdx].petId);
        if (petIdx !== -1) {
          pets[petIdx].status = 'available';
          saveData('pr_pets', pets);
        }
        requests[reqIdx].status = 'rejected';
        saveData('pr_adoptionRequests', requests);
      }
      showToast('Adoption request has been rejected. The pet is now available again.', 'info');
      renderAdminAdoptions();
      renderAvailablePets();
      updateAdminStats();
      updateHeroStats();
    }
  );
}

// ==========================================
//  CONTACT FORM
// ==========================================

function initContactForm() {
  const form = document.getElementById('contact-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormErrors(form);
    let valid = true;

    const fields = [
      { id: 'contact-name', msg: 'Please enter your name.' },
      { id: 'contact-email', msg: 'Please enter your email.' },
      { id: 'contact-message', msg: 'Please enter your message.' }
    ];

    fields.forEach(f => {
      const input = document.getElementById(f.id);
      const error = document.getElementById(f.id + '-error');
      if (!validateField(input, error, f.msg)) valid = false;
    });

    const emailInput = document.getElementById('contact-email');
    if (emailInput.value && !validateEmail(emailInput.value)) {
      emailInput.classList.add('error');
      const err = document.getElementById('contact-email-error');
      if (err) { err.textContent = 'Please enter a valid email.'; err.classList.add('show'); }
      valid = false;
    }

    if (!valid) {
      showToast('Please fix the errors in the form.', 'error');
      return;
    }

    // Store contact message
    const messages = getData('pr_contactMessages');
    messages.push({
      id: generateId(),
      name: document.getElementById('contact-name').value.trim(),
      email: document.getElementById('contact-email').value.trim(),
      message: document.getElementById('contact-message').value.trim(),
      date: new Date().toISOString()
    });
    saveData('pr_contactMessages', messages);

    form.reset();
    showToast('Your message has been sent successfully! We\'ll get back to you soon.', 'success');
  });
}

// ==========================================
//  SCROLL REVEAL ANIMATION
// ==========================================

function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ==========================================
//  INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initSampleData();
  initNavbar();
  initRescueForm();
  initFilters();
  initContactForm();
  renderAvailablePets();

  // Set today as max date for date found
  const dateInput = document.getElementById('rescue-date');
  if (dateInput) dateInput.max = new Date().toISOString().split('T')[0];

  // Scroll reveal
  setTimeout(initScrollReveal, 300);

  // Update hero stats dynamically
  updateHeroStats();
});

function updateHeroStats() {
  const pets = getData('pr_pets');
  const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  el('hero-stat-rescued', pets.length);
  el('hero-stat-adopted', pets.filter(p => p.status === 'adopted').length);
  el('hero-stat-available', pets.filter(p => p.status === 'available').length);
}

// ==========================================
//  ABSTRACT MODAL (Project Details)
// ==========================================

function openAbstract() {
  document.getElementById('abstract-modal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAbstract() {
  document.getElementById('abstract-modal').classList.remove('active');
  document.body.style.overflow = '';
}

// Close modal on overlay click
document.getElementById('abstract-modal')?.addEventListener('click', function (e) {
  if (e.target === this) closeAbstract();
});

// Close modal on Escape key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeAbstract();
});
