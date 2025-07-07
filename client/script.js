document.addEventListener("DOMContentLoaded", () => {
  // --- Constants ---
  const API_BASE_URL = "/api/ideas";
  // const API_BASE_URL = "http://localhost:5000/api/ideas";
  // Your backend server URL

  // --- State ---
  // No longer needed - data comes from API fetch
  // let ideasData = [];

  // --- DOM Elements ---
  const pendingTabLong = document.getElementById("pending-tab-long");
  const pendingTabShort = document.getElementById("pending-tab-short");
  const pendingLongList = document.getElementById("pending-long-list");
  const pendingShortList = document.getElementById("pending-short-list");

  const navHomeButton = document.getElementById("nav-home");
  const navAddIdeaButton = document.getElementById("nav-add-idea");
  const views = document.querySelectorAll(".view");
  const homeView = document.getElementById("home-view");
  const addIdeaView = document.getElementById("add-idea-view");
  const pendingIdeasList = document.getElementById("pending-ideas-list");
  const finishedIdeasList = document.getElementById("finished-ideas-list");
  const ideaTextarea = document.getElementById("idea-textarea");
  const charCounter = document.getElementById("char-counter");
  const ideaDescriptionTextarea = document.getElementById(
    "idea-description-textarea"
  );
  const longCategory = document.getElementById("long-category");
  const shortCategory = document.getElementById("short-category");
  const createIdeaButton = document.getElementById("create-idea-btn");
  const tabLong = document.getElementById("tab-long");
  const tabShort = document.getElementById("tab-short");
  const longVideoForm = document.getElementById("long-video-form");
  const shortVideoForm = document.getElementById("short-video-form");

  const longScriptTextarea = document.getElementById("long-script-textarea");
  const longTitleTextarea = document.getElementById("long-title-textarea");
  const longCharCounter = document.getElementById("long-char-counter");
  const longThumbnailTextarea = document.getElementById(
    "long-thumbnail-textarea"
  );
  const longDescriptionTextarea = document.getElementById(
    "long-description-textarea"
  );
  const longTagsTextarea = document.getElementById("long-tags-textarea");
  const createLongIdeaButton = document.getElementById("create-long-idea-btn");

  const shortScriptTextarea = document.getElementById("short-script-textarea");
  const shortTitleTextarea = document.getElementById("short-title-textarea");
  const shortCharCounter = document.getElementById("short-char-counter");
  const createShortIdeaButton = document.getElementById(
    "create-short-idea-btn"
  );

  const bubbleLong = document.getElementById("bubble-long");
  const bubbleShort = document.getElementById("bubble-short");

  // --- API Functions ---

  // Tab switching for pending ideas
  pendingTabLong.addEventListener("click", () => {
    pendingTabLong.classList.add("active");
    pendingTabShort.classList.remove("active");
    pendingLongList.style.display = "";
    pendingShortList.style.display = "none";
  });
  pendingTabShort.addEventListener("click", () => {
    pendingTabShort.classList.add("active");
    pendingTabLong.classList.remove("active");
    pendingLongList.style.display = "none";
    pendingShortList.style.display = "";
  });
  // --- Tab Switching ---
  tabLong.addEventListener("click", () => {
    tabLong.classList.add("active");
    tabShort.classList.remove("active");
    longVideoForm.style.display = "";
    shortVideoForm.style.display = "none";
  });
  tabShort.addEventListener("click", () => {
    tabShort.classList.remove("active");
    tabLong.classList.remove("active");
    tabShort.classList.add("active");
    longVideoForm.style.display = "none";
    shortVideoForm.style.display = "";
  });

  // --- Character Counters ---
  longTitleTextarea.addEventListener("input", () => {
    longCharCounter.textContent = `${longTitleTextarea.value.length} / 100`;
  });
  shortTitleTextarea.addEventListener("input", () => {
    shortCharCounter.textContent = `${shortTitleTextarea.value.length} / 100`;
  });

  // --- Add Idea Handlers ---
  // Long Video
  createLongIdeaButton.addEventListener("click", async () => {
    const title = longTitleTextarea.value.trim();
    const script = longScriptTextarea.value.trim();
    const thumbnail = longThumbnailTextarea.value.trim();
    const description = longDescriptionTextarea.value.trim();
    const tags = longTagsTextarea.value.trim();
    const category = longCategory.value; // <-- get selected category

    if (!title) {
      alert("Please enter a title.");
      return;
    }

    createLongIdeaButton.disabled = true;
    createLongIdeaButton.textContent = "Creating...";

    // Send all fields to backend
    const success = await addIdeaAPI(title, description, {
      script,
      thumbnail,
      tags,
      type: "long",
      category, // <-- send category
    });

    createLongIdeaButton.disabled = false;
    createLongIdeaButton.textContent = "Create Long Video Idea";

    if (success) {
      longTitleTextarea.value = "";
      longScriptTextarea.value = "";
      longThumbnailTextarea.value = "";
      longDescriptionTextarea.value = "";
      longTagsTextarea.value = "";
      longCategory.value = "Grace above";
      longCharCounter.textContent = "0 / 100";
      showView("home-view");
    }
  });

  // Short Video
  createShortIdeaButton.addEventListener("click", async () => {
    const title = shortTitleTextarea.value.trim();
    const script = shortScriptTextarea.value.trim();
    const category = shortCategory.value; // <-- get selected category

    if (!title) {
      alert("Please enter a title.");
      return;
    }

    createShortIdeaButton.disabled = true;
    createShortIdeaButton.textContent = "Creating...";

    // Only send script and title, mark as short
    const success = await addIdeaAPI(title, "", {
      script,
      type: "short",
      category, // <-- send category
    });

    createShortIdeaButton.disabled = false;
    createShortIdeaButton.textContent = "Create Short Video Idea";

    if (success) {
      shortTitleTextarea.value = "";
      shortScriptTextarea.value = "";
      shortCategory.value = "Grace above";
      shortCharCounter.textContent = "0 / 100";
      showView("home-view");
    }
  });
  // Fetch all ideas from the server
  const fetchIdeas = async () => {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const ideas = await response.json();
      renderIdeas(ideas); // Pass fetched ideas directly to render
    } catch (error) {
      console.error("Error fetching ideas:", error);
      alert(
        "Failed to load ideas. Please check the connection or try again later."
      );
      // Clear lists or show an error message in the UI
      pendingIdeasList.innerHTML =
        '<p class="empty-message error">Could not load pending ideas.</p>';
      finishedIdeasList.innerHTML =
        '<p class="empty-message error">Could not load finished ideas.</p>';
    }
  };

  // Add a new idea via API
  const addIdeaAPI = async (title, description, extra = {}) => {
    const body = { title, description, ...extra };
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg =
            errData.message || JSON.stringify(errData.errors) || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      fetchIdeas();
      return true;
    } catch (error) {
      console.error("Error adding idea:", error);
      alert(`Failed to add idea: ${error.message}`);
      return false;
    }
  };

  // Delete an idea via API
  const deleteIdeaAPI = async (id) => {
    if (!confirm("Are you sure you want to delete this idea?")) {
      return; // User cancelled
    }
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchIdeas(); // Refresh list on success
    } catch (error) {
      console.error("Error deleting idea:", error);
      alert("Failed to delete idea. Please try again.");
    }
  };

  // Mark an idea as finished via API
  const markAsFinishedAPI = async (id) => {
    const videoUrl = prompt(
      "Please enter the video URL for this finished idea:"
    );
    if (!videoUrl || videoUrl.trim() === "") {
      if (videoUrl !== null) {
        // Only alert if they didn't press Cancel
        alert("You must provide a URL to mark the idea as finished.");
      }
      return; // Exit if no URL provided or cancelled
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${id}/finish`, {
        method: "PATCH", // Use PATCH for partial update
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: videoUrl.trim() }),
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg =
            errData.message || JSON.stringify(errData.errors) || errorMsg;
        } catch (e) {
          /* Ignore parsing error */
        }
        throw new Error(errorMsg);
      }

      fetchIdeas(); // Refresh list on success
    } catch (error) {
      console.error("Error marking idea as finished:", error);
      alert(`Failed to finish idea: ${error.message}`);
    }
  };

  // --- UI Functions ---

  const showView = (viewId) => {
    views.forEach((view) => view.classList.remove("active-view"));
    document.getElementById(viewId).classList.add("active-view");
    document
      .querySelectorAll(".nav-button")
      .forEach((btn) => btn.classList.remove("active"));
    if (viewId === "home-view") navHomeButton.classList.add("active");
    else if (viewId === "add-idea-view")
      navAddIdeaButton.classList.add("active");
  };

  const closeAllDescriptions = () => {
    document.querySelectorAll(".idea-description.visible").forEach((desc) => {
      desc.classList.remove("visible");
    });
  };

  const toggleDescription = (event) => {
    if (event.target.closest("button")) return;
    const ideaItem = event.currentTarget.closest(".idea-item");
    if (!ideaItem) return;
    const descriptionDiv = ideaItem.querySelector(".idea-description");
    if (!descriptionDiv) return;
    const isCurrentlyVisible = descriptionDiv.classList.contains("visible");
    closeAllDescriptions();
    if (!isCurrentlyVisible) {
      descriptionDiv.classList.add("visible");
    }
  };

  // Modified to accept ideas array as parameter
  const renderIdeas = (ideasData) => {
    console.log("Ideas received:", ideasData);

    pendingLongList.innerHTML = "";
    pendingShortList.innerHTML = "";
    finishedIdeasList.innerHTML = "";

    // Separate ideas based on status and type
    const pendingLong = ideasData.filter(
      (idea) => idea.status === "pending" && idea.type === "long"
    );
    const pendingShort = ideasData.filter(
      (idea) => idea.status === "pending" && idea.type === "short"
    );
    const finishedIdeas = ideasData.filter(
      (idea) => idea.status === "finished"
    );

    // Update bubble counts
    bubbleLong.textContent = pendingLong.length;
    bubbleShort.textContent = pendingShort.length;

    const renderList = (list, container) => {
      if (list.length === 0) {
        container.innerHTML = `<p class="empty-message">No ideas yet!</p>`;
      } else {
        list.forEach((idea) => {
          const ideaElement = createIdeaElement(idea);
          container.appendChild(ideaElement);
        });
      }
    };

    renderList(pendingLong, pendingLongList);
    renderList(pendingShort, pendingShortList);
    renderList(finishedIdeas, finishedIdeasList);
  };

  // createIdeaElement remains largely the same, but uses _id from MongoDB
  // and formats the date from the server
  const createIdeaElement = (idea) => {
    // --- FINISHED IDEA: Use classic horizontal layout with Play button ---
    if (idea.status === "finished") {
      const div = document.createElement("div");
      div.className = "idea-item";
      div.style.display = "flex";
      div.style.flexDirection = "row";
      div.style.justifyContent = "space-between";
      div.style.alignItems = "center";

      // Left: Info
      const infoDiv = document.createElement("div");
      infoDiv.className = "info";
      infoDiv.innerHTML = `
      <span class="title" style="font-weight:bold; font-size:1.1em;">${
        idea.title || ""
      }</span>
      <div class="date" style="font-size:0.95em; color:#888; margin-top:4px;">
        Added: ${new Date(idea.createdAt || idea.date).toLocaleDateString()} 
        | Finished URL: <span style="color:#888;">${idea.url || ""}</span>
      </div>
    `;

      // Right: Play button
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "actions";
      actionsDiv.innerHTML = `
      <button class="play-btn" style="border:1px solid #2196f3; color:#2196f3; background:transparent; border-radius:6px; padding:4px 16px; font-size:1em; cursor:pointer;">
        <span class="icon" style="color:#2196f3; margin-right:4px;">&#9654;</span>Play
      </button>
    `;
      actionsDiv.querySelector(".play-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        playVideo(idea.url);
      });

      div.appendChild(infoDiv);
      div.appendChild(actionsDiv);
      return div;
    }

    // --- PENDING IDEA: Styled like your image ---
    const div = document.createElement("div");
    div.classList.add("idea-item", "pending-card");
    div.dataset.id = idea._id;

    // Set background color based on category
    if (idea.category === "Grace above") {
      div.style.background = "rgba(144, 238, 144, 0.5)"; // light green
    } else if (idea.category === "Faithful walk") {
      div.style.background = "rgba(255, 193, 7, 0.3)"; // light orange
    }

    // Helper to trim and add ellipsis
    const trimText = (text, maxLen = 80) =>
      text && text.length > maxLen ? text.slice(0, maxLen) + "..." : text || "";

    // Helper for "See More" logic
    function makeExpandableField(
      label,
      value,
      maxLen = 80,
      singleLine = false
    ) {
      if (!value) return document.createDocumentFragment();
      const container = document.createElement("div");
      container.className = "idea-field";
      const needsMore = value.length > maxLen;
      let expanded = false;

      container.innerHTML = `
        <div class="field-label">
          <span class="label-text">${label}:</span>
          <button class="copy-btn" data-copy="${value}">COPY</button>
        </div>
        <div class="field-value${singleLine ? " single-line" : ""}">
          <span class="field-content">${
            needsMore ? trimText(value, maxLen) : value
          }</span>
          ${needsMore ? `<a href="#" class="see-more-link">See More.</a>` : ""}
        </div>
      `;

      if (needsMore) {
        const seeMore = container.querySelector(".see-more-link");
        const content = container.querySelector(".field-content");
        seeMore.addEventListener("click", (e) => {
          e.preventDefault();
          expanded = !expanded;
          if (expanded) {
            content.textContent = value;
            seeMore.textContent = "See Less.";
          } else {
            content.textContent = trimText(value, maxLen);
            seeMore.textContent = "See More.";
          }
        });
        e;
      }

      // Copy handler
      container.querySelector(".copy-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value || "");
        e.target.textContent = "Copied!";
        setTimeout(() => (e.target.textContent = "COPY"), 1000);
      });

      return container;
    }

    // Script (multi-line, expandable)
    div.appendChild(
      makeExpandableField("Script", idea.script || "", 100, false)
    );
    // Title (single-line, no expand)
    div.appendChild(makeExpandableField("Title", idea.title || "", 100, false));
    // Thumbnail (single-line, no expand)
    div.appendChild(
      makeExpandableField("Thumbnail", idea.thumbnail || "", 100, false)
    );
    // Description (multi-line, expandable)
    div.appendChild(
      makeExpandableField("Description", idea.description || "", 100, false)
    );
    // Tags (multi-line, expandable)
    div.appendChild(makeExpandableField("Tags", idea.tags || "", 100, false));
    // Category (single-line, no expand) - Suggested change
    div.appendChild(
      makeExpandableField("Category", idea.category || "", 40, true)
    );

    // --- Finish & Delete Buttons ---
    if (idea.status === "pending") {
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "idea-actions";
      actionsDiv.innerHTML = `
        <button class="finish-btn" title="Finish"><span class="icon">&#10003;</span> Finish</button>
        <button class="delete-btn" title="Delete"><span class="icon">&#128465;</span> Delete</button>
      `;
      actionsDiv.querySelector(".finish-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        markAsFinishedAPI(idea._id);
      });
      actionsDiv.querySelector(".delete-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        deleteIdeaAPI(idea._id);
      });
      div.appendChild(actionsDiv);
    }

    return div;
  };

  const ideaCategory = document.getElementById("idea-category");

  const handleAddIdeaSubmit = async () => {
    const title = ideaTextarea.value.trim();
    const description = ideaDescriptionTextarea.value.trim();
    const category = ideaCategory.value; // <-- get selected category

    if (!title) {
      alert("Please enter an idea title.");
      return;
    }

    createIdeaButton.disabled = true;
    createIdeaButton.textContent = "Creating...";

    // Pass category to your API
    const success = await addIdeaAPI(title, description, { category });

    createIdeaButton.disabled = false;
    createIdeaButton.textContent = "Create Idea";

    if (success) {
      ideaTextarea.value = "";
      ideaDescriptionTextarea.value = "";
      ideaCategory.value = "Grace above";
      updateCharCounter();
      showView("home-view");
    }
  };

  // Play video function (no changes needed)
  const playVideo = (url) => {
    if (url) {
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }
      window.open(url, "_blank");
    } else {
      alert("No video URL associated with this idea.");
    }
  };

  // Update character counter (no changes needed)
  const updateCharCounter = () => {
    const currentLength = ideaTextarea.value.length;
    const maxLength = ideaTextarea.maxLength;
    charCounter.textContent = `${currentLength} / ${maxLength}`;
  };

  // Helper to prevent basic HTML injection (no changes needed)
  const escapeHTML = (str) => {
    if (typeof str !== "string") return "";
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  };
  // --- Initial Setup ---
  showView("home-view");
  fetchIdeas(); // <-- Load initial data from API
  // --- Event Listeners ---
  navHomeButton.addEventListener("click", () => showView("home-view"));
  navAddIdeaButton.addEventListener("click", () => showView("add-idea-view"));
  createIdeaButton.addEventListener("click", handleAddIdeaSubmit); // Use handler function
  ideaTextarea.addEventListener("input", updateCharCounter);
  // Toggle listener added dynamically in createIdeaElement

  // --- Initial Setup ---

  updateCharCounter();
});
