// Supabase Client
const supabase = supabase.createClient(
  'https://ntvezhauhgyaypfkvbh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dmV6aHBhbWhneWF5cGZrdmJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1MTM1ODIsImV4cCI6MjExMTA4OTU4Mn0.JfVsW8w_IrUmuX_5KRmtwPGw0ehhELRr6U5HS65zqsA'
);

let currentUser = null;

// Show page
function showPage(pageName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageName).classList.add('active');
  console.log('Showing page:', pageName);
}

// Switch tab (login/signup)
function switchTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const buttons = document.querySelectorAll('.tab-button');

  buttons.forEach(btn => btn.classList.remove('active'));
  
  if (tab === 'login') {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    buttons[0].classList.add('active');
  } else {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    buttons[1].classList.add('active');
  }
}

// Auth modal handlers
function handleAuthClick() {
  console.log('handleAuthClick called');
  if (currentUser) {
    console.log('User already logged in, showing dashboard');
    showPage('dashboard');
  } else {
    console.log('Opening auth modal');
    const modal = document.getElementById('authModal');
    if (!modal) {
      console.error('Auth modal not found!');
      return;
    }
    modal.classList.add('show');
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.remove('show');
  }
}

// Login handler
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  
  if (!email || !password) {
    errorEl.textContent = 'Veuillez remplir tous les champs';
    return;
  }

  try {
    const passwordHash = btoa(password);
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .eq('password_hash', passwordHash)
      .single();

    if (error || !user) {
      errorEl.textContent = 'Email ou mot de passe incorrect';
      console.log('Login error:', error);
      return;
    }

    currentUser = user;
    updateUI();
    closeAuthModal();
    showPage('dashboard');
    showAlert('Connecté avec succès!', 'success');
    console.log('Login successful:', user);
  } catch (err) {
    errorEl.textContent = 'Erreur: ' + err.message;
    console.error('Login error:', err);
  }
}

// Signup handler
async function handleSignup(e) {
  e.preventDefault();
  const email = document.getElementById('signupEmail').value;
  const username = document.getElementById('signupUsername').value;
  const fullname = document.getElementById('signupFullname').value;
  const password = document.getElementById('signupPassword').value;
  const errorEl = document.getElementById('signupError');

  if (!email || !username || !fullname || !password) {
    errorEl.textContent = 'Veuillez remplir tous les champs';
    return;
  }

  if (password.length < 6) {
    errorEl.textContent = 'Le mot de passe doit contenir au moins 6 caractères';
    return;
  }

  try {
    // Check if user already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (existing) {
      errorEl.textContent = 'Cet email est déjà utilisé';
      return;
    }

    const passwordHash = btoa(password);
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        email, 
        username, 
        full_name: fullname, 
        password_hash: passwordHash, 
        status: 'active'
      }])
      .select()
      .single();

    if (error) {
      errorEl.textContent = 'Erreur lors de la création du compte';
      console.error('Signup error:', error);
      return;
    }

    currentUser = data;
    updateUI();
    closeAuthModal();
    showPage('dashboard');
    showAlert('Compte créé avec succès!', 'success');
    console.log('Signup successful:', data);
  } catch (err) {
    errorEl.textContent = 'Erreur: ' + err.message;
    console.error('Signup error:', err);
  }
}

// Logout handler
function handleLogout() {
  currentUser = null;
  updateUI();
  showPage('home');
  showAlert('Déconnecté', 'info');
  console.log('Logged out');
}

// Update UI based on user state
function updateUI() {
  const authBtn = document.getElementById('authBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userDisplay = document.getElementById('userDisplay');

  if (currentUser) {
    authBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
    userDisplay.style.display = 'block';
    userDisplay.textContent = currentUser.full_name || currentUser.username;
    document.getElementById('dashboardLink').style.display = 'block';
    document.getElementById('profileLink').style.display = 'block';
    
    document.getElementById('profileName').textContent = currentUser.full_name || '-';
    document.getElementById('profileEmail').textContent = currentUser.email || '-';
    document.getElementById('profileUsername').textContent = currentUser.username || '-';
  } else {
    authBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
    userDisplay.style.display = 'none';
    document.getElementById('dashboardLink').style.display = 'none';
    document.getElementById('profileLink').style.display = 'none';
  }
}

// Show alert message
function showAlert(message, type = 'info') {
  const alertEl = document.getElementById('alert');
  alertEl.textContent = message;
  alertEl.className = `alert show alert-${type}`;
  setTimeout(() => alertEl.classList.remove('show'), 4000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('App loaded');
  updateUI();
  switchTab('login');
});
