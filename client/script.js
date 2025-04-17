document.addEventListener("DOMContentLoaded", () => {
  // --- Constants ---
  const API_BASE_URL = '/api/ideas';
  // Your backend server URL

  // --- State ---
  // No longer needed - data comes from API fetch
  // let ideasData = [];

  // --- DOM Elements ---
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

  // --- API Functions ---

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
  const addIdeaAPI = async (title, description) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        // Try to parse error message from backend if available
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

      // const newIdea = await response.json(); // Get the newly created idea back
      // Instead of optimistically adding, just re-fetch the whole list for simplicity
      fetchIdeas();
      return true; // Indicate success
    } catch (error) {
      console.error("Error adding idea:", error);
      alert(`Failed to add idea: ${error.message}`);
      return false; // Indicate failure
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
    pendingIdeasList.innerHTML = "";
    finishedIdeasList.innerHTML = "";

    // Separate ideas based on status
    const pendingIdeas = ideasData.filter((idea) => idea.status === "pending");
    const finishedIdeas = ideasData.filter(
      (idea) => idea.status === "finished"
    );

    // Close descriptions before rendering
    closeAllDescriptions();

    const renderList = (list, container) => {
      if (list.length === 0) {
        container.innerHTML = `<p class="empty-message">No ${
          container.id.includes("pending") ? "pending" : "finished"
        } ideas yet${container.id.includes("pending") ? "!" : "."}</p>`;
      } else {
        // Already sorted by server (newest first)
        list.forEach((idea) => {
          const ideaElement = createIdeaElement(idea);
          container.appendChild(ideaElement);
        });
      }
    };

    renderList(pendingIdeas, pendingIdeasList);
    renderList(finishedIdeas, finishedIdeasList);
  };

  // createIdeaElement remains largely the same, but uses _id from MongoDB
  // and formats the date from the server
  const createIdeaElement = (idea) => {
    const div = document.createElement("div");
    div.classList.add("idea-item");
    div.dataset.id = idea._id; // Use MongoDB's _id

    const infoDiv = document.createElement("div");
    infoDiv.classList.add("info");
    // Format date nicely
    const formattedDate = new Date(
      idea.createdAt || idea.date
    ).toLocaleDateString(); // Use createdAt if available
    infoDiv.innerHTML = `
          <span class="title">${escapeHTML(idea.title)}</span>
          <div class="idea-description">${escapeHTML(
            idea.description || ""
          )}</div>
          <span class="date">Added: ${formattedDate} ${
      idea.status === "finished" && idea.url
        ? `| Finished URL: ${escapeHTML(idea.url)}`
        : ""
    }</span>
      `;
    infoDiv.addEventListener("click", toggleDescription);
    div.appendChild(infoDiv);

    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("actions");

    if (idea.status === "pending") {
      const finishButton = document.createElement("button");
      finishButton.textContent = "✔ Finish";
      finishButton.classList.add("finish-btn");
      // Call API function
      finishButton.onclick = (e) => {
        e.stopPropagation();
        markAsFinishedAPI(idea._id);
      };
      actionsDiv.appendChild(finishButton);

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "✖ Delete";
      deleteButton.classList.add("delete-btn");
      // Call API function
      deleteButton.onclick = (e) => {
        e.stopPropagation();
        deleteIdeaAPI(idea._id);
      };
      actionsDiv.appendChild(deleteButton);
    } else if (idea.status === "finished") {
      const playButton = document.createElement("button");
      playButton.textContent = "▶ Play";
      playButton.classList.add("play-btn");
      // Play video logic remains client-side
      playButton.onclick = (e) => {
        e.stopPropagation();
        playVideo(idea.url);
      };
      if (!idea.url) {
        playButton.disabled = true;
        playButton.style.opacity = 0.5;
        playButton.title = "No URL provided";
      }
      actionsDiv.appendChild(playButton);
    }
    div.appendChild(actionsDiv);

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
