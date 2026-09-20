/**
 * Elder Connect - Main Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize State & Preferences
  initAccessibilityPreferences();
  SpeechAssistant.init();

  // 2. Initialize Views & Render Dynamic Elements
  initNavigation();
  initGreetingAndDate();
  renderSpeedDials();
  renderMedications();
  initWaterTracker();
  initMoodTracker();
  renderActiveRequests();
  renderVolunteers();
  renderActivities();
  renderFamilyFeed();

  // 3. Initialize Modals & Interactions
  initSOSSystem();
  initModals();
  initServiceChips();
});

/* ==========================================================================
   Accessibility & Theming
   ========================================================================== */
function initAccessibilityPreferences() {
  // Font Size Multiplier
  const savedScale = Storage.get('font_scale', '1');
  setFontScale(savedScale);

  document.getElementById('font-normal-btn')?.addEventListener('click', () => setFontScale('1'));
  document.getElementById('font-large-btn')?.addEventListener('click', () => setFontScale('1.15'));
  document.getElementById('font-xl-btn')?.addEventListener('click', () => setFontScale('1.3'));

  // Theme
  const savedTheme = Storage.get('theme', 'warm');
  setTheme(savedTheme);

  document.getElementById('theme-warm-btn')?.addEventListener('click', () => setTheme('warm'));
  document.getElementById('theme-contrast-btn')?.addEventListener('click', () => setTheme('contrast'));
  document.getElementById('theme-soft-btn')?.addEventListener('click', () => setTheme('soft'));

  // Speech Toggle
  const toggleSpeechBtn = document.getElementById('toggle-speech-btn');
  toggleSpeechBtn?.addEventListener('click', () => {
    SpeechAssistant.toggle();
  });
}

function setFontScale(scale) {
  document.documentElement.style.setProperty('--font-multiplier', scale);
  Storage.set('font_scale', scale);

  const btnNormal = document.getElementById('font-normal-btn');
  const btnLarge = document.getElementById('font-large-btn');
  const btnXl = document.getElementById('font-xl-btn');

  [btnNormal, btnLarge, btnXl].forEach(b => b?.classList.remove('active'));

  if (scale === '1') btnNormal?.classList.add('active');
  else if (scale === '1.15') btnLarge?.classList.add('active');
  else if (scale === '1.3') btnXl?.classList.add('active');
}

function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  Storage.set('theme', theme);

  const btnWarm = document.getElementById('theme-warm-btn');
  const btnContrast = document.getElementById('theme-contrast-btn');
  const btnSoft = document.getElementById('theme-soft-btn');

  [btnWarm, btnContrast, btnSoft].forEach(b => b?.classList.remove('active'));

  if (theme === 'warm') btnWarm?.classList.add('active');
  else if (theme === 'contrast') btnContrast?.classList.add('active');
  else if (theme === 'soft') btnSoft?.classList.add('active');
}

/* ==========================================================================
   Navigation
   ========================================================================== */
function initNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const sections = document.querySelectorAll('.view-section');
  const footerLinks = document.querySelectorAll('.footer-nav-link');

  function switchTab(targetId) {
    tabs.forEach(t => {
      const isTarget = t.getAttribute('data-tab') === targetId;
      t.classList.toggle('active', isTarget);
      t.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    sections.forEach(s => {
      s.classList.toggle('active', s.id === targetId);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Announce via speech if enabled
    const activeTab = document.querySelector(`.nav-tab[data-tab="${targetId}"]`);
    if (activeTab) {
      SpeechAssistant.speak(`Viewing ${activeTab.innerText.trim()}`);
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');
      switchTab(targetId);
    });
  });

  footerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-tab');
      switchTab(targetId);
    });
  });
}

/* ==========================================================================
   Header Greeting & Live Date
   ========================================================================== */
function initGreetingAndDate() {
  const dateDisplay = document.getElementById('live-date-display');
  const greetingDisplay = document.querySelector('.live-greeting');

  const now = new Date();
  const hours = now.getHours();
  let timeGreeting = "Good morning";
  if (hours >= 12 && hours < 17) timeGreeting = "Good afternoon";
  else if (hours >= 17) timeGreeting = "Good evening";

  if (greetingDisplay) {
    greetingDisplay.textContent = `${timeGreeting}, Eleanor!`;
  }

  if (dateDisplay) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = now.toLocaleDateString('en-US', options);
  }
}

/* ==========================================================================
   Mood & Wellness Tracker
   ========================================================================== */
function initMoodTracker() {
  const moodBtns = document.querySelectorAll('.mood-btn');
  const feedbackMsg = document.getElementById('mood-feedback-msg');
  const savedMood = Storage.get('today_mood', null);

  const moodResponses = {
    Great: "😊 Wonderful to hear, Eleanor! May your day be filled with warm smiles.",
    Peaceful: "😌 It is a calm, lovely day. Enjoy a quiet cup of tea and good thoughts.",
    Tired: "🥱 Make sure to rest your feet today and drink plenty of water. Take it easy!",
    NeedHelp: "💛 We are here for you Eleanor. Tap 'Ask for Help' or call David anytime."
  };

  if (savedMood) {
    moodBtns.forEach(btn => {
      if (btn.getAttribute('data-mood') === savedMood) {
        btn.classList.add('selected');
        btn.setAttribute('aria-checked', 'true');
        if (feedbackMsg) {
          feedbackMsg.textContent = moodResponses[savedMood] || "";
          feedbackMsg.style.display = 'block';
        }
      }
    });
  }

  moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mood = btn.getAttribute('data-mood');
      moodBtns.forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-checked', 'false');
      });

      btn.classList.add('selected');
      btn.setAttribute('aria-checked', 'true');
      Storage.set('today_mood', mood);

      const responseText = moodResponses[mood] || "Thank you for checking in!";
      if (feedbackMsg) {
        feedbackMsg.textContent = responseText;
        feedbackMsg.style.display = 'block';
      }

      SpeechAssistant.playSuccessBeep();
      SpeechAssistant.speak(responseText);
      showToast(`Mood logged: ${btn.querySelector('.mood-label').textContent}`);
    });
  });
}

/* ==========================================================================
   Medication & Routine Checklist
   ========================================================================== */
function getMedications() {
  return Storage.get('medications', DEFAULT_MEDICATIONS);
}

function saveMedications(meds) {
  Storage.set('medications', meds);
}

function renderMedications() {
  const meds = getMedications();
  const todayListContainer = document.getElementById('today-pill-list');
  const allMedsListContainer = document.getElementById('all-meds-list');

  if (todayListContainer) {
    todayListContainer.innerHTML = '';
    meds.forEach(med => {
      const pillItem = document.createElement('div');
      pillItem.className = `pill-item ${med.taken ? 'taken' : ''}`;
      pillItem.setAttribute('role', 'listitem');

      pillItem.innerHTML = `
        <div class="pill-checkbox-wrapper">
          <input type="checkbox" class="pill-checkbox" id="check-${med.id}" ${med.taken ? 'checked' : ''} aria-label="Mark ${med.name} as taken">
          <label for="check-${med.id}" class="pill-info" style="cursor: pointer;">
            <div class="pill-name">${med.name} • <span style="font-size: 0.95rem; font-weight: 600; color: var(--text-secondary);">${med.dosage}</span></div>
            <div class="pill-meta">⏰ ${med.timing} • <strong>${med.purpose}</strong></div>
            ${med.timeTaken ? `<div style="font-size: 0.85rem; color: var(--color-success); font-weight: 700;">✓ Taken at ${med.timeTaken}</div>` : ''}
          </label>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="pill-badge" style="border-color: var(--color-primary);">${med.purpose}</span>
          <button type="button" class="btn-read-aloud" data-read-aloud="${med.name}, ${med.dosage}. Take ${med.timing} for ${med.purpose}. ${med.taken ? 'Already marked as taken.' : 'Not taken yet.'}" aria-label="Read details of ${med.name} aloud">🔊</button>
        </div>
      `;

      // Checkbox listener
      const checkbox = pillItem.querySelector('.pill-checkbox');
      checkbox.addEventListener('change', (e) => {
        toggleMedicationStatus(med.id, e.target.checked);
      });

      todayListContainer.appendChild(pillItem);
    });
  }

  // Summary reader
  const readPillsSummaryBtn = document.getElementById('read-pills-summary');
  if (readPillsSummaryBtn) {
    readPillsSummaryBtn.onclick = () => {
      const remaining = meds.filter(m => !m.taken);
      if (remaining.length === 0) {
        SpeechAssistant.speak("All medications for today have been taken! Excellent job, Eleanor.");
      } else {
        const text = `You have ${remaining.length} pills remaining today: ` + remaining.map(m => `${m.name} at ${m.timing}`).join('. ');
        SpeechAssistant.speak(text);
      }
    };
  }

  // Also render full list in Health view
  if (allMedsListContainer) {
    allMedsListContainer.innerHTML = '';
    meds.forEach(med => {
      const item = document.createElement('div');
      item.className = 'pill-item';
      item.innerHTML = `
        <div class="pill-info">
          <div class="pill-name">${med.name} (${med.dosage})</div>
          <div class="pill-meta">Schedule: ${med.timing}</div>
          <div class="pill-meta" style="color: var(--color-primary); font-weight: 700;">Prescribed for: ${med.purpose}</div>
        </div>
        <button type="button" class="btn-read-aloud" data-read-aloud="${med.name}, dosage ${med.dosage}, schedule ${med.timing} for ${med.purpose}." aria-label="Read prescription details">🔊 Read</button>
      `;
      allMedsListContainer.appendChild(item);
    });
  }
}

function toggleMedicationStatus(medId, isTaken) {
  const meds = getMedications();
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const updated = meds.map(m => {
    if (m.id === medId) {
      return {
        ...m,
        taken: isTaken,
        timeTaken: isTaken ? timeStr : null
      };
    }
    return m;
  });

  saveMedications(updated);
  renderMedications();

  if (isTaken) {
    SpeechAssistant.playSuccessBeep();
    showToast("Medication marked as taken! 💊");
  }
}

/* ==========================================================================
   Speed Dial Quick Calls
   ========================================================================== */
function renderSpeedDials() {
  const container = document.getElementById('speed-dial-container');
  if (!container) return;

  const contacts = DEFAULT_USER.emergencyContacts;
  container.innerHTML = '';

  contacts.forEach(c => {
    const card = document.createElement('div');
    card.className = 'speed-dial-card';
    card.innerHTML = `
      <div class="dial-avatar" aria-hidden="true">${c.avatar}</div>
      <div class="dial-name">${c.name}</div>
      <div class="dial-relation">${c.relation}</div>
      <button type="button" class="btn-dial" aria-label="Call ${c.name}">
        <span>📞</span>
        <span>Call</span>
      </button>
    `;

    const callBtn = card.querySelector('.btn-dial');
    callBtn.addEventListener('click', () => {
      openCallModal(c);
    });

    container.appendChild(card);
  });
}

function openCallModal(contact) {
  const modal = document.getElementById('call-modal-overlay');
  const nameEl = document.getElementById('call-modal-title');
  const avatarEl = document.getElementById('call-avatar-icon');
  const phoneEl = document.getElementById('call-phone-display');
  const statusEl = document.getElementById('call-status-subtitle');

  if (!modal) return;

  nameEl.textContent = `Calling ${contact.name}...`;
  avatarEl.textContent = contact.avatar;
  phoneEl.textContent = contact.phone;
  statusEl.textContent = "Connecting high-definition voice line...";

  modal.classList.add('active');
  SpeechAssistant.playChime(440, 0.4);
  SpeechAssistant.speak(`Dialing ${contact.name}.`);

  setTimeout(() => {
    statusEl.textContent = "🟢 Connected • 00:01";
  }, 1600);
}

/* ==========================================================================
   Water Hydration Tracker
   ========================================================================== */
function initWaterTracker() {
  const container = document.getElementById('water-cups-container');
  const countLabel = document.getElementById('water-count-label');
  if (!container) return;

  let waterCount = Storage.get('water_cups', 3);

  function updateDisplay() {
    container.innerHTML = '';
    countLabel.textContent = `${waterCount} / 8 Glasses`;

    for (let i = 1; i <= 8; i++) {
      const isFilled = i <= waterCount;
      const cupBtn = document.createElement('button');
      cupBtn.type = 'button';
      cupBtn.className = `water-cup-btn ${isFilled ? 'filled' : ''}`;
      cupBtn.setAttribute('aria-label', `Glass ${i} of water, ${isFilled ? 'completed' : 'empty'}`);
      cupBtn.innerHTML = `
        <span class="cup-icon">🥛</span>
        <span>#${i}</span>
      `;

      cupBtn.addEventListener('click', () => {
        if (isFilled && i === waterCount) {
          waterCount--;
        } else {
          waterCount = i;
        }
        Storage.set('water_cups', waterCount);
        updateDisplay();
        SpeechAssistant.playChime(520, 0.2);

        if (waterCount === 8) {
          showToast("🎉 Congratulations! You reached your 8-glass water goal for today!");
          SpeechAssistant.speak("Congratulations Eleanor! You drank all 8 glasses of water today.");
        }
      });

      container.appendChild(cupBtn);
    }
  }

  updateDisplay();
}

/* ==========================================================================
   Ask for Help (Volunteers & Services)
   ========================================================================== */
function initServiceChips() {
  const chips = document.querySelectorAll('.chip-btn');
  const reqModal = document.getElementById('request-modal-overlay');
  const serviceSelect = document.getElementById('req-service-type');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const service = chip.getAttribute('data-service');
      if (serviceSelect) {
        for (let i = 0; i < serviceSelect.options.length; i++) {
          if (serviceSelect.options[i].text.includes(service)) {
            serviceSelect.selectedIndex = i;
            break;
          }
        }
      }
      reqModal?.classList.add('active');
      SpeechAssistant.speak(`Selected ${service}. Opening request details.`);
    });
  });

  document.getElementById('btn-custom-help-request')?.addEventListener('click', () => {
    reqModal?.classList.add('active');
  });
}

function getHelpRequests() {
  return Storage.get('help_requests', DEFAULT_HELP_REQUESTS);
}

function renderActiveRequests() {
  const container = document.getElementById('active-requests-container');
  if (!container) return;

  const requests = getHelpRequests();
  container.innerHTML = '';

  if (requests.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); font-size: 1.05rem;">You currently have no scheduled help requests.</p>';
    return;
  }

  requests.forEach(req => {
    const card = document.createElement('div');
    card.className = 'request-status-card';
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
        <div style="font-size: 1.25rem; font-weight: 800;">${req.service}</div>
        <span class="status-badge ${req.statusColor || 'status-confirmed'}">${req.status}</span>
      </div>
      <div style="font-size: 1rem; color: var(--text-secondary); margin-bottom: 0.4rem;">
        📅 <strong>Time:</strong> ${req.date} &nbsp;•&nbsp; 📍 <strong>Location:</strong> ${req.destination}
      </div>
      <div style="font-size: 1rem; color: var(--color-primary); font-weight: 700; margin-bottom: 0.4rem;">
        🤝 Volunteer Companion: ${req.volunteer}
      </div>
      ${req.notes ? `<div style="font-size: 0.95rem; color: var(--text-muted); font-style: italic;">Note: "${req.notes}"</div>` : ''}
    `;
    container.appendChild(card);
  });
}

function renderVolunteers() {
  const container = document.getElementById('volunteers-list-container');
  if (!container) return;

  container.innerHTML = '';
  DEFAULT_VOLUNTEERS.forEach(v => {
    const card = document.createElement('div');
    card.className = 'volunteer-card';
    card.innerHTML = `
      <div>
        <div class="volunteer-header">
          <div class="volunteer-avatar" aria-hidden="true">${v.avatar}</div>
          <div>
            <div class="volunteer-name">${v.name}</div>
            <div class="volunteer-role">${v.role}</div>
            <div class="volunteer-rating">${v.rating} • ${v.distance}</div>
          </div>
        </div>
        <p style="font-size: 0.95rem; color: var(--text-secondary); margin-top: 0.8rem;">${v.bio}</p>
        <div class="volunteer-skills">
          ${v.specialties.map(s => `<span class="skill-tag">${s}</span>`).join('')}
        </div>
      </div>
      <button type="button" class="btn-request-vol" data-vol-name="${v.name}" aria-label="Request assistance with ${v.name}">
        Request ${v.name}
      </button>
    `;

    const bookBtn = card.querySelector('.btn-request-vol');
    bookBtn.addEventListener('click', () => {
      const reqModal = document.getElementById('request-modal-overlay');
      const volSelect = document.getElementById('req-volunteer-preference');
      if (volSelect) {
        volSelect.value = v.name;
      }
      reqModal?.classList.add('active');
    });

    container.appendChild(card);
  });
}

/* ==========================================================================
   Community & Activities
   ========================================================================== */
function getActivities() {
  return Storage.get('activities', DEFAULT_ACTIVITIES);
}

function renderActivities() {
  const container = document.getElementById('activities-list-container');
  if (!container) return;

  const activities = getActivities();
  container.innerHTML = '';

  activities.forEach(act => {
    const card = document.createElement('div');
    card.className = 'activity-card';
    card.innerHTML = `
      <span class="activity-badge">${act.badge}</span>
      <h4 class="activity-title">${act.title}</h4>
      <div class="activity-meta">
        <div class="activity-meta-item"><span>⏰</span> <span>${act.time}</span></div>
        <div class="activity-meta-item"><span>📍</span> <span>${act.location}</span></div>
        <div class="activity-meta-item"><span>👤</span> <span>Host: ${act.host}</span></div>
      </div>
      <p style="font-size: 1rem; color: var(--text-secondary); margin-top: 0.4rem;">${act.description}</p>
      <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted); margin-top: 0.2rem;">
        👥 ${act.attendees} neighbors attending
      </div>
      <button type="button" class="btn-rsvp ${act.rsvp ? 'attending' : ''}" aria-pressed="${act.rsvp}">
        <span>${act.rsvp ? '✓ Attending' : '+ Join Activity'}</span>
      </button>
    `;

    const rsvpBtn = card.querySelector('.btn-rsvp');
    rsvpBtn.addEventListener('click', () => {
      act.rsvp = !act.rsvp;
      act.attendees += act.rsvp ? 1 : -1;
      Storage.set('activities', activities);
      renderActivities();

      if (act.rsvp) {
        SpeechAssistant.playSuccessBeep();
        SpeechAssistant.speak(`You are signed up for ${act.title}. We will remind you!`);
        showToast(`You have joined ${act.title}! 🌿`);
      } else {
        showToast(`RSVP removed for ${act.title}`);
      }
    });

    container.appendChild(card);
  });

  // Story sharing button
  document.getElementById('btn-share-story')?.addEventListener('click', () => {
    const story = prompt("Share a brief memory or vacation story with your neighbors:");
    if (story) {
      SpeechAssistant.speak("Thank you for sharing your memory! It has been posted to the community board.");
      showToast("Thank you! Your story has been shared with the community. 💌");
    }
  });

  document.getElementById('btn-read-community-stories')?.addEventListener('click', () => {
    SpeechAssistant.speak("Reading stories: Arthur remembered a 1968 road trip across Route 66 in a convertible. Clara shared memories of gathering wild blackberries with her mother in Ohio.");
    showToast("Opening Community Story Reader 📖");
  });
}

/* ==========================================================================
   Family & Messages Feed
   ========================================================================== */
function renderFamilyFeed() {
  const container = document.getElementById('family-feed-container');
  if (!container) return;

  container.innerHTML = '';
  DEFAULT_FAMILY_FEED.forEach(post => {
    const card = document.createElement('article');
    card.className = 'feed-card';
    card.innerHTML = `
      <div class="feed-header">
        <div class="feed-avatar" aria-hidden="true">${post.avatar}</div>
        <div>
          <div class="feed-author">${post.sender}</div>
          <div class="feed-time">${post.time} • ${post.relation}</div>
        </div>
      </div>
      <img src="${post.photoUrl}" alt="Family photo shared by ${post.sender}" class="feed-image" loading="lazy" onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22350%22 viewBox=%220 0 600 350%22><rect fill=%22%23fef3c7%22 width=%22600%22 height=%22350%22/><text fill=%22%23b45309%22 font-family=%22sans-serif%22 font-size=%2226%22 font-weight=%22bold%22 text-anchor=%22middle%22 x=%22300%22 y=%22180%22>Family Memory Photo</text></svg>';">
      <div class="feed-content">
        <p class="feed-caption">${post.caption}</p>
        
        ${post.hasVoice ? `
          <div class="voice-note-player">
            <button type="button" class="btn-voice-play" aria-label="Play voice note from ${post.sender}">
              ▶
            </button>
            <div style="flex: 1;">
              <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.2rem;">${post.audioNote}</div>
              <div class="voice-bar">
                <div class="voice-progress"></div>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="feed-actions">
          <button type="button" class="btn-hug">
            <span>❤️</span>
            <span>Send a Warm Hug</span>
          </button>
          <button type="button" class="btn-quick-reply" data-reply="Thank you for sharing! I love you dearly.">
            <span>💬</span>
            <span>Send "I Love You"</span>
          </button>
          <button type="button" class="btn-read-aloud" data-read-aloud="${post.sender} wrote: ${post.caption}">
            <span>🔊 Read Message</span>
          </button>
        </div>
      </div>
    `;

    // Voice note simulation
    const playBtn = card.querySelector('.btn-voice-play');
    const progressBar = card.querySelector('.voice-progress');
    if (playBtn && progressBar) {
      let isPlaying = false;
      playBtn.addEventListener('click', () => {
        if (!isPlaying) {
          isPlaying = true;
          playBtn.textContent = '⏸';
          progressBar.style.width = '100%';
          SpeechAssistant.speak(post.caption, true);
          setTimeout(() => {
            isPlaying = false;
            playBtn.textContent = '▶';
            progressBar.style.width = '0%';
          }, 4500);
        } else {
          isPlaying = false;
          playBtn.textContent = '▶';
          progressBar.style.width = '0%';
          if (SpeechAssistant.synth) SpeechAssistant.synth.cancel();
        }
      });
    }

    // Hug button
    const hugBtn = card.querySelector('.btn-hug');
    hugBtn?.addEventListener('click', () => {
      SpeechAssistant.playSuccessBeep();
      showToast(`Warm hug sent to ${post.sender}! ❤️`);
    });

    // Quick reply
    const replyBtn = card.querySelector('.btn-quick-reply');
    replyBtn?.addEventListener('click', () => {
      SpeechAssistant.playSuccessBeep();
      showToast(`Reply sent to ${post.sender}: "I love you dearly!"`);
    });

    container.appendChild(card);
  });
}

/* ==========================================================================
   Modals & Form Submissions
   ========================================================================== */
function initModals() {
  // Request Help Form
  const helpForm = document.getElementById('help-request-form');
  const reqModal = document.getElementById('request-modal-overlay');
  const closeReqModalBtn = document.getElementById('btn-close-request-modal');
  const cancelReqModalBtn = document.getElementById('btn-cancel-req-modal');

  const closeHelpModal = () => reqModal?.classList.remove('active');
  closeReqModalBtn?.addEventListener('click', closeHelpModal);
  cancelReqModalBtn?.addEventListener('click', closeHelpModal);

  helpForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const service = document.getElementById('req-service-type').value;
    const time = document.getElementById('req-preferred-time').value;
    const volunteer = document.getElementById('req-volunteer-preference').value;
    const notes = document.getElementById('req-notes').value;

    const newRequest = {
      id: `req-${Date.now()}`,
      service: service,
      date: time,
      destination: "Eleanor's Residence (Apt 4B)",
      volunteer: volunteer === "Any Verified Volunteer" ? "Marcus Chen (Assigned)" : volunteer,
      status: "Confirmed",
      statusColor: "status-confirmed",
      notes: notes
    };

    const currentRequests = getHelpRequests();
    currentRequests.unshift(newRequest);
    Storage.set('help_requests', currentRequests);

    closeHelpModal();
    renderActiveRequests();
    helpForm.reset();

    SpeechAssistant.playSuccessBeep();
    SpeechAssistant.speak(`Your request for ${service} has been placed. We notified your caregiver.`);
    showToast(`Request submitted successfully! 🤝`);
  });

  // Add Medication Form
  const medForm = document.getElementById('add-medication-form');
  const medModal = document.getElementById('add-med-modal-overlay');
  const openMedModalBtn = document.getElementById('btn-open-add-med');
  const closeMedModalBtn = document.getElementById('btn-close-med-modal');
  const cancelMedModalBtn = document.getElementById('btn-cancel-med-modal');

  const closeMedModal = () => medModal?.classList.remove('active');
  openMedModalBtn?.addEventListener('click', () => medModal?.classList.add('active'));
  closeMedModalBtn?.addEventListener('click', closeMedModal);
  cancelMedModalBtn?.addEventListener('click', closeMedModal);

  medForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('med-input-name').value;
    const dosage = document.getElementById('med-input-dosage').value;
    const timing = document.getElementById('med-input-timing').value;
    const purpose = document.getElementById('med-input-purpose').value || "General Health";

    const newMed = {
      id: `med-${Date.now()}`,
      name: name,
      dosage: dosage,
      timing: timing,
      purpose: purpose,
      pillColor: "blue",
      taken: false,
      timeTaken: null
    };

    const meds = getMedications();
    meds.push(newMed);
    saveMedications(meds);

    closeMedModal();
    renderMedications();
    medForm.reset();

    SpeechAssistant.playSuccessBeep();
    SpeechAssistant.speak(`New reminder saved for ${name}.`);
    showToast(`Medication reminder saved: ${name}`);
  });

  // Call Modal End Call
  const callModal = document.getElementById('call-modal-overlay');
  const endCallBtn = document.getElementById('btn-end-call');
  endCallBtn?.addEventListener('click', () => {
    callModal?.classList.remove('active');
    showToast("Call ended");
  });

  // Close modals with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(m => {
        // If SOS is active, don't dismiss casually without cancelling
        if (m.id === 'sos-modal-overlay') {
          cancelSOS();
        } else {
          m.classList.remove('active');
        }
      });
    }
  });
}

/* ==========================================================================
   Emergency SOS System
   ========================================================================== */
let sosCountdownInterval = null;
let sosRemaining = 5;

function initSOSSystem() {
  const triggerBtn = document.getElementById('btn-trigger-sos');
  const cancelBtn = document.getElementById('btn-cancel-sos');

  triggerBtn?.addEventListener('click', startSOSCountdown);
  cancelBtn?.addEventListener('click', cancelSOS);
}

function startSOSCountdown() {
  const overlay = document.getElementById('sos-modal-overlay');
  const countdownEl = document.getElementById('sos-countdown-number');
  const secondsText = document.getElementById('sos-seconds-text');

  if (!overlay || !countdownEl) return;

  sosRemaining = 5;
  countdownEl.textContent = sosRemaining;
  if (secondsText) secondsText.textContent = `${sosRemaining} seconds`;

  overlay.classList.add('active');
  SpeechAssistant.startSOSSiren();
  SpeechAssistant.speak("Emergency SOS initiated. Alerting contacts in five seconds. Press cancel if you are safe.", true);

  if (sosCountdownInterval) clearInterval(sosCountdownInterval);

  sosCountdownInterval = setInterval(() => {
    sosRemaining--;
    if (sosRemaining > 0) {
      countdownEl.textContent = sosRemaining;
      if (secondsText) secondsText.textContent = `${sosRemaining} seconds`;
    } else {
      clearInterval(sosCountdownInterval);
      countdownEl.textContent = "✓";
      countdownEl.style.borderColor = "#16a34a";
      countdownEl.style.color = "#16a34a";
      if (secondsText) secondsText.textContent = "ALERTS DISPATCHED";

      SpeechAssistant.stopSOSSiren();
      SpeechAssistant.speak("Emergency alert has been sent to David Vance and Oakwood Emergency Services with your GPS coordinates.", true);
      showToast("🚨 Emergency responders and family alerted!");
    }
  }, 1000);
}

function cancelSOS() {
  const overlay = document.getElementById('sos-modal-overlay');
  if (sosCountdownInterval) {
    clearInterval(sosCountdownInterval);
    sosCountdownInterval = null;
  }
  SpeechAssistant.stopSOSSiren();
  overlay?.classList.remove('active');
  SpeechAssistant.speak("Emergency SOS cancelled. You are safe.", true);
  showToast("SOS alert cancelled. Stay safe! 🕊️");
}

/* ==========================================================================
   Accessible Toast Notifications
   ========================================================================== */
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span style="font-size: 1.3rem;">ℹ️</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
