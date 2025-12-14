// Blockchain data storage
let blockchainData = [];

// Client Management
async function createClient() {
  const name = document.getElementById("clientName").value;
  if (!name) {
    showMessage("clientError", "Please enter a name");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const result = await response.json();

    if (result.success) {
      showMessage("clientSuccess", `Client "${name}" created!`);
      document.getElementById("clientName").value = "";
      loadClients();
    }
  } catch (error) {
    showMessage("clientError", "Error creating client");
  }
}

async function loadClients() {
  const response = await fetch(`${API_BASE_URL}/api/clients`);
  const result = await response.json();

  const clientsList = document.getElementById("clientsList");
  const sender = document.getElementById("sender");
  const recipient = document.getElementById("recipient");

  clientsList.innerHTML = "";
  sender.innerHTML = '<option value="">Select sender</option>';
  recipient.innerHTML = '<option value="">Select recipient</option>';

  result.data.forEach((client) => {
    clientsList.innerHTML += `<div class="client-item"><strong>${client.name}</strong><br><small>${client.identity}</small></div>`;
    sender.innerHTML += `<option value="${client.name}">${client.name}</option>`;
    recipient.innerHTML += `<option value="${client.name}">${client.name}</option>`;
  });
}

// Transaction Management
async function createTransaction() {
  const sender = document.getElementById("sender").value;
  const recipient = document.getElementById("recipient").value;
  const value = parseFloat(document.getElementById("amount").value);

  if (!sender || !recipient || !value) {
    showMessage("txError", "Please fill all fields");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender, recipient, value }),
    });
    const result = await response.json();

    if (result.success) {
      showMessage("txSuccess", "Transaction created!");
      document.getElementById("amount").value = "";
      loadPendingTransactions();
    }
  } catch (error) {
    showMessage("txError", "Error creating transaction");
  }
}

async function loadPendingTransactions() {
  const response = await fetch(`${API_BASE_URL}/api/transactions/pending`);
  const result = await response.json();

  const pendingList = document.getElementById("pendingList");
  pendingList.innerHTML = "";

  if (result.data.length === 0) {
    pendingList.innerHTML =
      '<div class="empty-state" style="padding: 20px; font-size: 0.9em;">No pending transactions</div>';
  } else {
    result.data.forEach((tx) => {
      const senderShort = tx.sender.substring(0, 10);
      const recipientShort = tx.recipient.substring(0, 10);
      pendingList.innerHTML += `
        <div class="transaction-item">
          <div class="transaction-flow">
            <span class="flow-sender">${senderShort}...</span>
            <span class="flow-arrow">→</span>
            <span class="flow-recipient">${recipientShort}...</span>
          </div>
          <div style="margin-top: 5px;">
            <strong style="color: #f67d19ff;">${tx.value} coins</strong>
            <br><small>${tx.time}</small>
          </div>
        </div>
      `;
    });
  }
}

// Mining
async function mineBlock() {
  const difficulty = parseInt(document.getElementById("difficulty").value) || 2;
  document.getElementById("miningStatus").style.display = "block";

  try {
    const response = await fetch(`${API_BASE_URL}/api/mine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ difficulty }),
    });
    const result = await response.json();

    if (result.success) {
      loadBlockchain();
      loadPendingTransactions();
    }
  } catch (error) {
    alert("Error mining block: " + error.message);
  } finally {
    document.getElementById("miningStatus").style.display = "none";
  }
}

// Blockchain Display
async function loadBlockchain() {
  const response = await fetch(`${API_BASE_URL}/api/blockchain`);
  const result = await response.json();
  blockchainData = result.data;

  const visual = document.getElementById("blockchainVisual");

  if (result.data.length === 0) {
    visual.innerHTML =
      '<div class="empty-state">No blocks yet. Create clients, transactions, and mine your first block!</div>';
  } else {
    visual.innerHTML = "";
    result.data.forEach((block) => {
      const tamperedStyle = block.is_tampered
        ? "border: 3px solid #ff4444; background: #4d1a1a;"
        : "";
      const tamperedBadge = block.is_tampered
        ? '<span style="color: #ff4444; font-weight: bold;">⚠️ TAMPERED</span><br>'
        : "";
      visual.innerHTML += `
        <div class="block" onclick="showBlockDetails(${block.block_number})" style="${tamperedStyle}">
          <div class="block-header">Block #${block.block_number}</div>
          <div class="block-info">
            ${tamperedBadge}
            <strong>Nonce:</strong> ${block.nonce}<br>
            <strong>Transactions:</strong> ${block.transactions.length}<br>
            <strong>Block Hash:</strong><br>
            <div class="hash">${block.block_hash}</div><br>
            <strong>Previous Block Hash:</strong><br>
            <div class="hash">${block.previous_hash}</div><br>
          </div>
        </div>
      `;
    });
  }
}

// Block Details Modal
async function showBlockDetails(blockNumber) {
  const block = blockchainData[blockNumber];
  if (!block) return;

  document.getElementById(
    "modalHeader"
  ).textContent = `Block #${blockNumber} Details`;

  const modalBody = document.getElementById("modalBody");
  const tamperedWarning = block.is_tampered
    ? '<p style="color: #ff4444; font-weight: bold; font-size: 1.1em;">⚠️ THIS BLOCK HAS BEEN TAMPERED WITH!</p>'
    : "";

  modalBody.innerHTML = `
    ${tamperedWarning}
    
    <div class="modal-section">
      <h3>Block Information</h3>
      <p style="color: #f67d19ff;"><strong>Block Number:</strong> ${
        block.block_number
      }</p>
      <p style="color: #f67d19ff;"><strong>Nonce:</strong> ${block.nonce}</p>
      <p style="color: #f67d19ff;"><strong>Transactions Count:</strong> ${
        block.transactions.length
      }</p>
      <p style="color: #f67d19ff;"><strong>Status:</strong> ${
        block.is_tampered
          ? '<span style="color: #ff4444;">Tampered</span>'
          : '<span style="color: #90ee90;">Valid</span>'
      }</p>
      ${
        !block.is_tampered
          ? `<button onclick="tamperBlock(${block.block_number}); closeModal();" style="margin-top: 15px; background: #ff4444;">
        ⚠️ Tamper This Block (Demo)
      </button>`
          : ""
      }
    </div>

    <div class="modal-section">
      <h3>Block Data (What gets hashed)</h3>
      <div class="modal-hash" style="font-size: 0.8em; max-height: 150px; overflow-y: auto;">${
        block.block_data
      }</div>
      <p style="color: #888; font-size: 0.85em; margin-top: 10px;">This is the raw data that gets hashed. Any change here breaks the hash.</p>
    </div>

    <div class="modal-section">
      <h3>Block Hash (Stored - Original)</h3>
      <div class="modal-hash">${block.block_hash}</div>
      ${
        block.is_tampered
          ? `
        <p style="color: #ff4444; margin-top: 10px; font-weight: bold;">⚠️ This hash is now INVALID!</p>
        <h3 style="margin-top: 20px; color: #ff4444;">Actual Hash (After Tampering)</h3>
        <div class="modal-hash" style="border: 2px solid #ff4444;">${block.actual_hash}</div>
        <p style="color: #888; font-size: 0.85em; margin-top: 10px;">
          ⚠️ The stored hash doesn't match the actual hash of the current data.<br>
          This proves the block was tampered with!<br>
          Notice: The new hash doesn't start with '0' times difficulty (doesn't meet difficulty).
        </p>
      `
          : ""
      }
    </div>

    <div class="modal-section">
      <h3>Previous Block Hash</h3>
      <div class="modal-hash">${block.previous_hash}</div>
    </div>

    <div class="modal-section">
      <h3 style="color: #f67d19ff;">Transactions (${
        block.transactions.length
      })</h3>
      ${block.transactions
        .map(
          (tx, i) => `
        <div class="transaction-detail">
          <p style="color: #f67d19ff;"><strong>Transaction #${
            i + 1
          }</strong></p>
          <p style="color: #f67d19ff;"><strong>Signature:</strong></p>
          <div class="modal-hash" style="font-size: 0.85em; margin-top: 5px;">${tx}</div>
        </div>
      `
        )
        .join("")}
    </div>
  `;

  document.getElementById("blockModal").style.display = "flex";
}

function closeModal(event) {
  if (!event || event.target.id === "blockModal") {
    document.getElementById("blockModal").style.display = "none";
  }
}

// Validation
async function validateBlockchain() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/validate`);
    const result = await response.json();

    if (result.success && result.data.valid) {
      showMessage("validateSuccess", result.data.message);
    } else {
      const errorMsg = result.data.errors
        ? result.data.errors.join(", ")
        : "Validation failed";
      showMessage("validateError", errorMsg);
    }
  } catch (error) {
    showMessage("validateError", "Error validating blockchain");
  }
}

// Tampering
async function tamperBlock(blockNumber) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tamper/${blockNumber}`, {
      method: "POST",
    });
    const result = await response.json();

    if (result.success) {
      alert(result.data.message);
      loadBlockchain();
    }
  } catch (error) {
    alert("Error tampering block");
  }
}

// Reset Blockchain
async function resetBlockchain() {
  if (
    !confirm(
      "Are you sure you want to reset the entire blockchain? This cannot be undone."
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/reset`, {
      method: "POST",
    });
    const result = await response.json();

    if (result.success) {
      showMessage("validateSuccess", "Blockchain reset successfully!");
      loadClients();
      loadPendingTransactions();
      loadBlockchain();
    }
  } catch (error) {
    showMessage("validateError", "Error resetting blockchain");
  }
}

// Utility Functions
function showMessage(id, message) {
  const element = document.getElementById(id);
  element.textContent = message;
  element.style.display = "block";
  setTimeout(() => (element.style.display = "none"), 3000);
}

// Theme Toggle
function toggleTheme() {
  const body = document.body;
  const themeToggle = document.getElementById("themeToggle");

  body.classList.toggle("light-mode");

  if (body.classList.contains("light-mode")) {
    themeToggle.textContent = "Light Mode";
    localStorage.setItem("theme", "light");
  } else {
    themeToggle.textContent = "Dark Mode";
    localStorage.setItem("theme", "dark");
  }
}

// Load saved theme
function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  const themeToggle = document.getElementById("themeToggle");

  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    themeToggle.textContent = "Light Mode";
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadTheme();
  loadClients();
  loadPendingTransactions();
  loadBlockchain();
});
