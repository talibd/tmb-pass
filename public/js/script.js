document.addEventListener("DOMContentLoaded", function () {
    // Show/Hide Password Logic
    document.querySelectorAll("[data-eye-btn]").forEach(function (eyeBtn) {
      const card = eyeBtn.closest(".flex.flex-col");
      if (!card) return;

      const passwordInput = card.querySelector("[data-password-input]");
      const eyeIcon = card.querySelector("[data-eye-icon]");
      const eyeClosedIcon = card.querySelector("[data-eye-closed-icon]");

      eyeIcon.style.display = "none";
      eyeClosedIcon.style.display = "inline";

      eyeBtn.addEventListener("click", function () {
        const isCurrentlyHidden = passwordInput.type === "password";

        document.querySelectorAll("[data-password-input]").forEach(function (input) {
          input.type = "password";
        });

        document.querySelectorAll("[data-eye-icon]").forEach((el) => (el.style.display = "none"));
        document.querySelectorAll("[data-eye-closed-icon]").forEach((el) => (el.style.display = "inline"));

        if (isCurrentlyHidden) {
          passwordInput.type = "text";
          eyeIcon.style.display = "inline";
          eyeClosedIcon.style.display = "none";
        }
      });
    });


    // tab section 

   const accountsTab = document.getElementById('accountsTab');
    const usersTab = document.getElementById('usersTab');
    const addPasswordBtn = document.getElementById('openPasswordPopupBtn');
    const addUserBtn = document.getElementById('openUserPopupBtn');
    const accountsSection = document.getElementById('accountsSection');
    const usersSection = document.getElementById('usersSection');

    if (accountsTab && usersTab && addPasswordBtn && addUserBtn) {
      // Default: show password button, hide user button
      addPasswordBtn.classList.remove('hidden');
      addUserBtn.classList.add('hidden');

      accountsTab.addEventListener('click', function () {
        addPasswordBtn.classList.remove('hidden');
        addUserBtn.classList.add('hidden');
        accountsSection.style.display = '';
        usersSection.style.display = 'none';
      });

      usersTab.addEventListener('click', function () {
        addPasswordBtn.classList.add('hidden');
        addUserBtn.classList.remove('hidden');
        accountsSection.style.display = 'none';
        usersSection.style.display = '';
      });
    }

  let toastTimeout;

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "custom-toast";

  toast.innerHTML = `
    <span>${message}</span>
    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
  `;

  document.body.appendChild(toast);

  // Trigger entrance animation
  setTimeout(() => toast.classList.add("show"), 10);

  // Clear previous timer and reset
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    document.querySelectorAll(".custom-toast").forEach((t) => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 300);
    });
  }, 2000);
}


    // Copy Password Logic
    document.querySelectorAll("[data-copy-btn]").forEach(function (copyBtn) {
      copyBtn.addEventListener("click", function () {
        const card = copyBtn.closest(".flex.flex-col");
        if (!card) return;

        const passwordInput = card.querySelector("[data-password-input]");
        const password = passwordInput.value;

        navigator.clipboard.writeText(password)
          .then(() => showToast("Copied"))
          .catch(err => {
            console.error("Failed to copy: ", err);
            showToast("Failed to copy!");
          });
      });
    });


     document.querySelectorAll("[data-card-toggle]").forEach(function (toggleBtn) {
  toggleBtn.addEventListener("click", function () {
    const card = toggleBtn.closest(".flex.flex-col");
    const content = card.querySelector("[data-card-content]");
    const chevronDown = toggleBtn.querySelector("[data-chevron-down]");
    const chevronUp = toggleBtn.querySelector("[data-chevron-up]");

    if (!card || !content) return;

    const isExpanded = card.classList.contains("expanded");

    // Collapse all other cards
    document.querySelectorAll(".flex.flex-col.expanded").forEach(function (otherCard) {
      if (otherCard !== card) {
        const otherContent = otherCard.querySelector("[data-card-content]");
        const otherChevronDown = otherCard.querySelector("[data-chevron-down]");
        const otherChevronUp = otherCard.querySelector("[data-chevron-up]");

        if (otherContent) {
          otherContent.style.maxHeight = otherContent.scrollHeight + "px";
          requestAnimationFrame(() => {
            otherContent.style.maxHeight = "0px";
          });
        }

        if (otherChevronDown) otherChevronDown.style.display = "inline";
        if (otherChevronUp) otherChevronUp.style.display = "none";

        otherCard.classList.remove("expanded");
      }
    });

    if (isExpanded) {
      // Collapse current card
      content.style.maxHeight = content.scrollHeight + "px";
      requestAnimationFrame(() => {
        content.style.maxHeight = "0px";
      });
      chevronDown.style.display = "inline";
      chevronUp.style.display = "none";
      card.classList.remove("expanded");
    } else {
      // Expand current card
      content.style.maxHeight = "150px";
      chevronDown.style.display = "none";
      chevronUp.style.display = "inline";
      card.classList.add("expanded");

      setTimeout(() => {
        content.style.maxHeight = "none";
      }, 500); // Match your CSS transition duration
    }
  });
});


// search bar 

const searchInput = document.getElementById("w_search");
  const cards = document.querySelectorAll("[data-card]");

  searchInput?.addEventListener("input", function () {
    const query = searchInput.value.toLowerCase();

    cards.forEach(card => {
      const title = card.getAttribute("data-title")?.toLowerCase() || "";
      const subtitle = card.getAttribute("data-subtitle")?.toLowerCase() || "";
      const username = card.getAttribute("data-username")?.toLowerCase() || "";

      const matches = title.includes(query) || subtitle.includes(query) || username.includes(query);

      card.style.display = matches ? "block" : "none";
    });
  });



  // add passward popup 


    // Remove old popupForm logic if not used anymore
    // const popup = document.getElementById("popupForm");
    // const openBtn = document.getElementById("openPopupBtn");
    // const closeBtn = document.getElementById("closePopupBtn");

    // openBtn?.addEventListener("click", () => popup.classList.remove("hidden"));
    // closeBtn?.addEventListener("click", () => popup.classList.add("hidden"));
    // popup?.addEventListener("click", (e) => {
    //   if (e.target === popup) popup.classList.add("hidden");
    // });

    // Add Password/User popup logic (place this inside DOMContentLoaded)
    const passwordPopup = document.getElementById("passwordPopupForm");
    const userPopup = document.getElementById("userPopupForm");
    const openPasswordBtn = document.getElementById("openPasswordPopupBtn");
    const openUserBtn = document.getElementById("openUserPopupBtn");
    const closePasswordBtn = document.getElementById("closePasswordPopupBtn");
    const closeUserBtn = document.getElementById("closeUserPopupBtn");

    openPasswordBtn?.addEventListener("click", () => passwordPopup.classList.remove("hidden"));
    closePasswordBtn?.addEventListener("click", () => passwordPopup.classList.add("hidden"));
    passwordPopup?.addEventListener("click", (e) => {
      if (e.target === passwordPopup) passwordPopup.classList.add("hidden");
    });

    openUserBtn?.addEventListener("click", () => userPopup.classList.remove("hidden"));
    closeUserBtn?.addEventListener("click", () => userPopup.classList.add("hidden"));
    userPopup?.addEventListener("click", (e) => {
      if (e.target === userPopup) userPopup.classList.add("hidden");
    });



    // form code 

 const urlInput = document.getElementById('urlinput');
  const favicon = document.getElementById('platformFavicon');
  const faviconInput = document.getElementById('faviconInput');
  const platformInput = document.getElementById('platformInput');
  const defaultFavicon = '/images/logo.png';

urlInput?.addEventListener('input', function () {
  try {
    let url = new URL(urlInput.value);
    let domain = url.hostname.replace(/^www\./, ''); // Remove www. if present
    let domainName = domain.split('.')[0]; // Get only the first part before any dot
    let faviconUrl = `https://www.google.com/s2/favicons?domain=${url}&sz=64`;
    favicon.src = faviconUrl;
    faviconInput.value = faviconUrl;
    platformInput.value = domainName;
  } catch (e) {
    favicon.src = defaultFavicon;
    faviconInput.value = defaultFavicon;
    platformInput.value = '';
  }
});


// edit form 

  document.querySelectorAll('.edit-btn').forEach(function(editIcon) {
    editIcon.parentElement.addEventListener('click', function () {
      const card = editIcon.closest('.card-wrapper');
      const title = card.dataset.title;
      const subtitle = card.dataset.subtitle;
      const username = card.dataset.username;
      const password = card.querySelector('[data-password-input]').value;
      const favicon = card.dataset.favicon;
      const labels = Array.from(card.querySelectorAll('.py-1')).map(e => e.textContent.trim()).join(', ');

      // Find the account id by matching email+platform+username (or add data-id to card)
      fetch('/api/find-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: title, email: subtitle, username })
      })
      .then(res => res.json())
      .then(data => {
        document.getElementById('editId').value = data.id;
        document.getElementById('editPlatform').value = title;
        document.getElementById('editEmail').value = subtitle;
        document.getElementById('editUsername').value = username;
        document.getElementById('editPassword').value = password;
        document.getElementById('editTags').value = labels;
        document.getElementById('editFavicon').value = favicon;
        document.getElementById('editPlatformFavicon').src = favicon;
        document.getElementById('editPopupForm').classList.remove('hidden');
      });
    });
  });

  // Close modal
  document.getElementById('closeEditPopupBtn').onclick = function () {
    document.getElementById('editPopupForm').classList.add('hidden');
  };

  // Submit edit form
  document.getElementById('editForm').onsubmit = function (e) {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const data = {
      platform: document.getElementById('editPlatform').value,
      email: document.getElementById('editEmail').value,
      username: document.getElementById('editUsername').value,
      password: document.getElementById('editPassword').value,
      labels: document.getElementById('editTags').value.split(',').map(t => t.trim()).filter(Boolean),
      favicon: document.getElementById('editFavicon').value
    };
    fetch('/edit-password/' + id, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(() => window.location.reload());
  };


  // delete button 

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      if (!confirm('Are you sure you want to delete this account?')) return;
      const id = this.getAttribute('data-id');
      const res = await fetch(`/delete-password/${id}`, { method: 'DELETE' });
      if (res.ok) {
        // Option 1: Remove card from DOM
        this.closest('.card-wrapper').remove();
        // Option 2: Reload page
        // location.reload();
      } else {
        alert('Failed to delete');
      }
    });
  });


  // popup 

  


  // prompt("please enter the password to access", "");

   const url = new URL(window.location.href);
  if (url.searchParams.has("admin")) {
    fetch("/api/check-admin")
      .then(res => res.json())
      .then(data => {
        if (!data.isAdmin) {
          const password = prompt("Please enter the password to access:", "");
          if (!password) return;

          fetch("/api/validate-admin", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ password }),
          })
            .then((res) => {
              if (!res.ok) throw new Error("Invalid password");
              return res.json();
            })
            .then(() => {
              alert("Admin access granted!");
              window.location.href = "/"; // Refresh without ?admin
            })
            .catch(() => {
              alert("Wrong password");
              window.location.href = "/";
            });
        }
      });
  }


  // User block toggle logic
document.querySelectorAll('.user-block-toggle').forEach(function (checkbox) {
  checkbox.addEventListener('change', function () {
    const userId = this.getAttribute('data-user-id');
    const blocked = this.checked;
    fetch('/api/block-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, blocked })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update user');
        // Optionally show a toast or feedback
      })
      .catch(() => {
        alert('Failed to update user status');
        // Optionally revert checkbox state
        this.checked = !blocked;
      });
  });
});


// delete user 

document.querySelectorAll('.user-delete-btn').forEach(btn => {
  btn.addEventListener('click', async function() {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const id = this.getAttribute('data-delete-user-id');
    const res = await fetch(`/delete-user/${id}`, { method: 'DELETE' });
    if (res.ok) {
      this.closest('.card-wrapper').remove();
    } else {
      alert('Failed to delete user');
    }
  });
});

  // The user login check is now handled by server-side redirection.
  // The `isLoggedIn` variable (if set globally from EJS) would reflect the server's view.
  // The admin login prompt below is still active and necessary for the ?admin flow.
  
  // ...rest of your existing code...
  
});