document.addEventListener("DOMContentLoaded", () => {
  // --- Constants ---
  // const API_BASE_URL = "/api/ideas";
  const API_BASE_URL = "http://localhost:5000/api/ideas";
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
  const createIdeaButton = document.getElementById("create-idea-btn");
  // ...existing code...
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
  createLongIdeaButton.addEventListener("click", async () => {
    const title = longTitleTextarea.value.trim();
    const script = longScriptTextarea.value.trim();
    const thumbnail = longThumbnailTextarea.value.trim();
    const description = longDescriptionTextarea.value.trim();
    const tags = longTagsTextarea.value.trim();

    if (!title) {
      alert("Please enter a title.");
      return;
    }
    // You can add more validation as needed

    createLongIdeaButton.disabled = true;
    createLongIdeaButton.textContent = "Creating...";

    // Send all fields to backend
    const success = await addIdeaAPI(title, description, {
      script,
      thumbnail,
      tags,
      type: "long",
    });

    createLongIdeaButton.disabled = false;
    createLongIdeaButton.textContent = "Create Long Video Idea";

    if (success) {
      longTitleTextarea.value = "";
      longScriptTextarea.value = "";
      longThumbnailTextarea.value = "";
      longDescriptionTextarea.value = "";
      longTagsTextarea.value = "";
      longCharCounter.textContent = "0 / 100";
      showView("home-view");
    }
  });
  createShortIdeaButton.addEventListener("click", async () => {
    const title = shortTitleTextarea.value.trim();
    const script = shortScriptTextarea.value.trim();

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
    });

    createShortIdeaButton.disabled = false;
    createShortIdeaButton.textContent = "Create Short Video Idea";

    if (success) {
      shortTitleTextarea.value = "";
      shortScriptTextarea.value = "";
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
    try {
      const body = { title, description, ...extra };
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
    const div = document.createElement("div");
    div.classList.add("idea-item");
    div.dataset.id = idea._id;

    // Helper to trim and add ellipsis
    const trimText = (text, maxLen = 50) =>
      text && text.length > maxLen ? text.slice(0, maxLen) + "..." : text || "";

    // --- Script with Show More/See Less ---
    const scriptDiv = document.createElement("div");
    scriptDiv.className = "idea-script";
    const script = idea.script || "";
    const scriptLines = script.split("\n");
    const scriptShort = scriptLines.slice(0, 2).join("\n");
    const needsShowMore = scriptLines.length > 2 || script.length > 120;

    scriptDiv.innerHTML = `
    <div class="field-label">Script</div>
    <pre class="script-content">${
      needsShowMore ? trimText(scriptShort, 120) : scriptShort
    }</pre>
    ${needsShowMore ? `<a href="#" class="show-more-link">Show more</a>` : ""}
    <button class="copy-btn" data-copy="${script.replace(
      /"/g,
      "&quot;"
    )}">COPY</button>
  `;

    // --- Title ---
    const titleDiv = document.createElement("div");
    titleDiv.className = "idea-title";
    titleDiv.innerHTML = `
    <div class="field-label">Title</div>
    <span class="single-line">${trimText(idea.title, 40)}</span>
    <button class="copy-btn" data-copy="${idea.title || ""}">COPY</button>
  `;

    // --- Thumbnail ---
    const thumbDiv = document.createElement("div");
    thumbDiv.className = "idea-thumbnail";
    thumbDiv.innerHTML = `
    <div class="field-label">Thumbnail</div>
    <span class="single-line">${trimText(idea.thumbnail, 40)}</span>
    <button class="copy-btn" data-copy="${idea.thumbnail || ""}">COPY</button>
  `;

    // --- Description ---
    const descDiv = document.createElement("div");
    descDiv.className = "idea-description";
    descDiv.innerHTML = `
    <div class="field-label">Description</div>
    <span class="single-line">${trimText(idea.description, 40)}</span>
    <button class="copy-btn" data-copy="${idea.description || ""}">COPY</button>
  `;

    // --- Tags ---
    const tagsDiv = document.createElement("div");
    tagsDiv.className = "idea-tags";
    tagsDiv.innerHTML = `
    <div class="field-label">Tags</div>
    <span class="single-line">${trimText(idea.tags, 40)}</span>
    <button class="copy-btn" data-copy="${idea.tags || ""}">COPY</button>
  `;

    // --- Compose ---
    div.appendChild(scriptDiv);
    div.appendChild(titleDiv);
    if (idea.type === "long" || !idea.type) {
      div.appendChild(thumbDiv);
      div.appendChild(descDiv);
      div.appendChild(tagsDiv);
    }

    // --- Show More/See Less Handler ---
    const showMoreLink = scriptDiv.querySelector(".show-more-link");
    const scriptContent = scriptDiv.querySelector(".script-content");
    let expanded = false;
    if (showMoreLink) {
      showMoreLink.addEventListener("click", (e) => {
        e.preventDefault();
        expanded = !expanded;
        if (expanded) {
          scriptContent.textContent = script;
          showMoreLink.textContent = "See less";
        } else {
          scriptContent.textContent = trimText(scriptShort, 120);
          showMoreLink.textContent = "Show more";
        }
      });
    }

    // --- Copy Handler ---
    div.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const text = btn.getAttribute("data-copy");
        navigator.clipboard.writeText(text || "");
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = "COPY"), 1000);
      });
    });

    return div;
  };

  // Handle Add Idea Form Submission
  const handleAddIdeaSubmit = async () => {
    const title = ideaTextarea.value.trim();
    const description = ideaDescriptionTextarea.value.trim();

    if (!title) {
      alert("Please enter an idea title.");
      return;
    }

    // Disable button temporarily to prevent double submission
    createIdeaButton.disabled = true;
    createIdeaButton.textContent = "Creating...";

    const success = await addIdeaAPI(title, description);

    // Re-enable button
    createIdeaButton.disabled = false;
    createIdeaButton.textContent = "Create Idea";

    if (success) {
      ideaTextarea.value = "";
      ideaDescriptionTextarea.value = "";
      updateCharCounter();
      showView("home-view"); // Switch view after successful add (fetchIdeas called by API function)
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

  // --- Event Listeners ---
  navHomeButton.addEventListener("click", () => showView("home-view"));
  navAddIdeaButton.addEventListener("click", () => showView("add-idea-view"));
  createIdeaButton.addEventListener("click", handleAddIdeaSubmit); // Use handler function
  ideaTextarea.addEventListener("input", updateCharCounter);
  // Toggle listener added dynamically in createIdeaElement

  // --- Initial Setup ---
  showView("home-view");
  fetchIdeas(); // <-- Load initial data from API
  updateCharCounter();
});
