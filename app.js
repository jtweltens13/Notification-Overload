const demoNotifications = [
  {
    title: "Canvas Reminder: Optional Discussion Post This Weekend",
    body: "Useful course activity, but it does not require an immediate interruption.",
    type: "general",
    source: "Canvas",
  },
  {
    title: "Library Email: Citation Workshop Tomorrow",
    body: "Helpful, but not urgent while the student is focused on writing.",
    type: "general",
    source: "Email",
  },
  {
    title: "Writing Center: Peer Review Slots Still Open This Week",
    body: "Appointments are available if you want extra feedback on your draft.",
    type: "general",
    source: "Email",
  },
  {
    title: "Campus Bookstore: Football Jersey Sale Ends Friday",
    body: "A promotion message tied to game week merchandise.",
    type: "general",
    source: "Email",
  },
  {
    title: "Professor Lin: Paper Deadline Moved to Tomorrow at Noon",
    body: "The final paper is now due tomorrow at noon instead of Friday evening.",
    type: "deadline",
    source: "Canvas",
    dueHours: 16,
  },
  {
    title: "Advisor Message: Reply With Practicum Availability by 5 PM",
    body: "Please send your practicum availability before 5 PM today.",
    type: "person",
    source: "Email",
  },
  {
    title: "Registrar: Sociology Class Moved to Harper 214",
    body: "Tomorrow's sociology lecture will meet in Harper 214.",
    type: "schedule",
    source: "Registrar",
  },
  {
    title: "Student Life: Tailgate Volunteer Signup Still Open",
    body: "Volunteer spots remain for Saturday's pregame event.",
    type: "general",
    source: "Canvas",
  },
  {
    title: "Recreation Center: Intramural Flag Football Standings Updated",
    body: "Your residence hall team moved up one spot this week.",
    type: "general",
    source: "Email",
  },
];

const state = {
  activeTab: "draft",
  inboxTab: "unread",
  inboxOpen: false,
  prioritiesOpen: false,
  notifications: [],
  toasts: [],
  nextId: 1,
  demoStarted: false,
  nextNotificationIndex: 0,
  nextTriggerAt: 20,
  initialDraftLength: 0,
  maxTypedDelta: 0,
  settings: {
    deadlines: true,
    people: true,
    schedule: true,
    canvas: true,
    email: true,
    registrar: true,
    deadlineWindow: 24,
  },
};

const sourceSettings = {
  Canvas: "canvas",
  Email: "email",
  Registrar: "registrar",
};

const tabRoutes = {
  draft: "paper-draft",
  source: "source-article",
  notes: "research-notes",
};

const tabUrls = {
  draft: "docs.google.com/document/d/college-football-draft",
  source: "campus-journal.edu/articles/college-football-as-campus-culture",
  notes: "keep.google.com/u/0/#NOTE/football-paper-research",
};

const initialDraftValue = document.querySelector("#paperDraft").value;
const initialTitleValue = document.querySelector("#paperTitle").value;

const elements = {
  workspace: document.querySelector(".workspace"),
  addressBar: document.querySelector("#addressBar"),
  openInboxButton: document.querySelector("#openInboxButton"),
  closeInboxButton: document.querySelector("#closeInboxButton"),
  inboxDrawer: document.querySelector("#inboxDrawer"),
  inboxList: document.querySelector("#inboxList"),
  unreadTabButton: document.querySelector("#unreadTabButton"),
  readTabButton: document.querySelector("#readTabButton"),
  openPriorityButton: document.querySelector("#openPriorityButton"),
  closePriorityButton: document.querySelector("#closePriorityButton"),
  priorityPanel: document.querySelector("#priorityPanel"),
  startModal: document.querySelector("#startModal"),
  startDemoButton: document.querySelector("#startDemoButton"),
  restartDemoButton: document.querySelector("#restartDemoButton"),
  toastRegion: document.querySelector("#toastRegion"),
  sessionStatus: document.querySelector("#sessionStatus"),
  paperTitle: document.querySelector("#paperTitle"),
  deadlineToggle: document.querySelector("#deadlineToggle"),
  peopleToggle: document.querySelector("#peopleToggle"),
  scheduleToggle: document.querySelector("#scheduleToggle"),
  canvasToggle: document.querySelector("#canvasToggle"),
  emailToggle: document.querySelector("#emailToggle"),
  registrarToggle: document.querySelector("#registrarToggle"),
  windowSelect: document.querySelector("#windowSelect"),
  paperDraft: document.querySelector("#paperDraft"),
  tabButtons: Array.from(document.querySelectorAll("[data-tab]")),
  tabPanels: Array.from(document.querySelectorAll("[data-panel]")),
};

const routeToTab = Object.fromEntries(
  Object.entries(tabRoutes).map(([tab, route]) => [route, tab])
);

const initialTabFromHash = routeToTab[window.location.hash.slice(1)];
if (initialTabFromHash) {
  state.activeTab = initialTabFromHash;
}

bindEvents();
render();

function bindEvents() {
  elements.openInboxButton.addEventListener("click", () => {
    state.inboxOpen = true;
    state.inboxTab = "unread";
    state.prioritiesOpen = false;
    render();
  });

  elements.closeInboxButton.addEventListener("click", () => {
    state.inboxOpen = false;
    render();
  });

  elements.unreadTabButton.addEventListener("click", () => {
    state.inboxTab = "unread";
    renderInbox();
  });

  elements.readTabButton.addEventListener("click", () => {
    state.inboxTab = "read";
    renderInbox();
  });

  elements.openPriorityButton.addEventListener("click", () => {
    state.prioritiesOpen = true;
    state.inboxOpen = false;
    render();
  });

  elements.closePriorityButton.addEventListener("click", () => {
    state.prioritiesOpen = false;
    render();
  });

  elements.startDemoButton.addEventListener("click", startDemo);
  elements.restartDemoButton.addEventListener("click", restartDemo);

  elements.deadlineToggle.addEventListener("change", (event) => {
    state.settings.deadlines = event.target.checked;
    render();
  });

  elements.peopleToggle.addEventListener("change", (event) => {
    state.settings.people = event.target.checked;
    render();
  });

  elements.scheduleToggle.addEventListener("change", (event) => {
    state.settings.schedule = event.target.checked;
    render();
  });

  elements.canvasToggle.addEventListener("change", (event) => {
    state.settings.canvas = event.target.checked;
    render();
  });

  elements.emailToggle.addEventListener("change", (event) => {
    state.settings.email = event.target.checked;
    render();
  });

  elements.registrarToggle.addEventListener("change", (event) => {
    state.settings.registrar = event.target.checked;
    render();
  });

  elements.windowSelect.addEventListener("change", (event) => {
    state.settings.deadlineWindow = Number(event.target.value);
    render();
  });

  elements.paperDraft.addEventListener("input", handleDraftInput);

  elements.tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      renderTabs();
    });
  });

  document.addEventListener("click", (event) => {
    const dismissButton = event.target.closest("[data-dismiss-toast]");
    if (dismissButton) {
      dismissToast(dismissButton.dataset.dismissToast);
      return;
    }

    const openButton = event.target.closest("[data-open-notification]");
    if (openButton) {
      openNotification(openButton.dataset.openNotification);
      return;
    }

    const readButton = event.target.closest("[data-mark-read]");
    if (readButton) {
      markAsRead(readButton.dataset.markRead);
    }
  });
}

function startDemo() {
  state.demoStarted = true;
  state.activeTab = "draft";
  state.notifications = [];
  state.toasts = [];
  state.nextId = 1;
  state.nextNotificationIndex = 0;
  state.nextTriggerAt = 20;
  state.maxTypedDelta = 0;
  state.inboxOpen = false;
  state.inboxTab = "unread";
  state.prioritiesOpen = false;
  state.initialDraftLength = elements.paperDraft.value.length;
  elements.startModal.classList.add("hidden");
  elements.startModal.setAttribute("aria-hidden", "true");
  render();
  elements.paperDraft.focus();
}

function restartDemo() {
  state.demoStarted = false;
  state.activeTab = "draft";
  state.notifications = [];
  state.toasts = [];
  state.nextId = 1;
  state.nextNotificationIndex = 0;
  state.nextTriggerAt = 20;
  state.maxTypedDelta = 0;
  state.inboxOpen = false;
  state.inboxTab = "unread";
  state.prioritiesOpen = false;
  elements.paperDraft.value = initialDraftValue;
  elements.paperTitle.value = initialTitleValue;
  elements.startModal.classList.remove("hidden");
  elements.startModal.setAttribute("aria-hidden", "false");
  render();
}

function handleDraftInput() {
  if (!state.demoStarted) {
    return;
  }

  const typedDelta = Math.max(0, elements.paperDraft.value.length - state.initialDraftLength);
  state.maxTypedDelta = Math.max(state.maxTypedDelta, typedDelta);

  while (
    state.nextNotificationIndex < demoNotifications.length &&
    state.maxTypedDelta >= state.nextTriggerAt
  ) {
    receiveNotification(demoNotifications[state.nextNotificationIndex]);
    state.nextNotificationIndex += 1;
    state.nextTriggerAt += 20;
  }

  render();
}

function receiveNotification(notification) {
  const evaluated = evaluateNotification(notification);
  const item = {
    id: String(state.nextId++),
    ...notification,
    important: evaluated.important,
    unread: true,
  };

  state.notifications.unshift(item);

  if (item.important) {
    state.toasts.unshift(item);
  }
}

function evaluateNotification(notification) {
  const sourceSetting = sourceSettings[notification.source];
  const sourceAllowed = sourceSetting ? state.settings[sourceSetting] : true;

  if (
    notification.type === "deadline" &&
    state.settings.deadlines &&
    notification.dueHours <= state.settings.deadlineWindow &&
    sourceAllowed
  ) {
    return {
      important: true,
    };
  }

  if (notification.type === "person" && state.settings.people && sourceAllowed) {
    return {
      important: true,
    };
  }

  if (notification.type === "schedule" && state.settings.schedule && sourceAllowed) {
    return {
      important: true,
    };
  }

  return {
    important: false,
  };
}

function dismissToast(id) {
  const before = state.toasts.length;
  state.toasts = state.toasts.filter((toast) => toast.id !== id);
  if (state.toasts.length !== before) {
    renderToasts();
  }
}

function openNotification(id) {
  state.inboxOpen = true;
  state.inboxTab = "unread";
  state.prioritiesOpen = false;
  dismissToast(id);
  render();
}

function markAsRead(id) {
  const notification = state.notifications.find((item) => item.id === id);
  if (notification) {
    notification.unread = false;
  }
  dismissToast(id);
  render();
}

function render() {
  renderTabs();
  renderControls();
  renderStatus();
  renderInbox();
  renderPriorityPanel();
  renderToasts();
}

function renderTabs() {
  elements.workspace.dataset.activeTab = state.activeTab;
  elements.addressBar.textContent = tabUrls[state.activeTab];
  window.history.replaceState(null, "", `#${tabRoutes[state.activeTab]}`);

  elements.tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === state.activeTab);
  });

  elements.tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === state.activeTab);
  });
}

function renderControls() {
  elements.deadlineToggle.checked = state.settings.deadlines;
  elements.peopleToggle.checked = state.settings.people;
  elements.scheduleToggle.checked = state.settings.schedule;
  elements.canvasToggle.checked = state.settings.canvas;
  elements.emailToggle.checked = state.settings.email;
  elements.registrarToggle.checked = state.settings.registrar;
  elements.windowSelect.value = String(state.settings.deadlineWindow);
}

function renderStatus() {
  if (!state.demoStarted) {
    elements.sessionStatus.textContent = "";
    return;
  }

  if (state.nextNotificationIndex >= demoNotifications.length) {
    elements.sessionStatus.textContent = "All demo notifications have arrived. Keep writing or review missed notifications.";
    return;
  }

  elements.sessionStatus.textContent = "";
}

function renderInbox() {
  elements.inboxDrawer.classList.toggle("open", state.inboxOpen);
  elements.inboxDrawer.setAttribute("aria-hidden", state.inboxOpen ? "false" : "true");
  elements.unreadTabButton.classList.toggle("active", state.inboxTab === "unread");
  elements.readTabButton.classList.toggle("active", state.inboxTab === "read");

  if (!state.notifications.length) {
    elements.inboxList.innerHTML = '<div class="notification-card">No new notifications.</div>';
    return;
  }

  const unreadItems = state.notifications.filter((item) => item.unread);
  const readItems = state.notifications.filter((item) => !item.unread);
  const visibleItems = state.inboxTab === "unread" ? unreadItems : readItems;
  const emptyMessage = state.inboxTab === "unread" ? "No unread notifications." : "No read notifications yet.";

  elements.inboxList.innerHTML = visibleItems.length
    ? visibleItems.map((item) => renderInboxCard(item, state.inboxTab === "unread")).join("")
    : `<div class="notification-card">${emptyMessage}</div>`;
}

function renderInboxCard(item, showAction) {
  const badgeClass = item.important ? "important" : "batched";
  const badgeText = item.important ? "Interrupted" : "Saved for later";
  const footer = showAction
    ? `
      <div class="notification-footer">
        <button class="mark-read-button" data-mark-read="${item.id}" type="button">Mark read</button>
      </div>
    `
    : "";

  return `
    <article class="notification-card ${item.unread ? "unread" : ""}">
      <div class="notification-head">
        <span class="notification-badge ${badgeClass}">${badgeText}</span>
        <span class="notification-meta">${item.source}</span>
      </div>
      <h3 class="notification-title">${item.title}</h3>
      <p>${item.body}</p>
      ${footer}
    </article>
  `;
}

function renderPriorityPanel() {
  elements.priorityPanel.classList.toggle("open", state.prioritiesOpen);
  elements.priorityPanel.setAttribute("aria-hidden", state.prioritiesOpen ? "false" : "true");
}

function renderToasts() {
  elements.toastRegion.innerHTML = state.toasts
    .map(
      (toast) => `
        <article class="toast">
          <div class="notification-head">
            <span class="importance-badge important">Important</span>
            <span class="notification-meta">${toast.source}</span>
          </div>
          <h3 class="toast-title">${toast.title}</h3>
          <p>${toast.body}</p>
          <div class="toast-footer">
            <div class="toast-buttons">
              <button class="toast-action" data-open-notification="${toast.id}" type="button">
                Open inbox
              </button>
              <button data-dismiss-toast="${toast.id}" type="button">Dismiss</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}
