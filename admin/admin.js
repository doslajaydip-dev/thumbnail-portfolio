const SUPABASE_URL =
    "https://snzuoikhihrgmmweqeao.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_FGMRamhkSCXV0WNzIupCkg_WmMMZTtZ";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


/* ELEMENTS */

const loginScreen =
    document.getElementById("loginScreen");

const adminDashboard =
    document.getElementById("adminDashboard");

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginButton =
    document.getElementById("loginButton");

const loginStatus =
    document.getElementById("loginStatus");

const logoutButton =
    document.getElementById("logoutButton");

const thumbnailInput =
    document.getElementById("thumbnail");

const titleInput =
    document.getElementById("title");

const categoryInput =
    document.getElementById("category");

const publishButton =
    document.getElementById("publish");

const refreshButton =
    document.getElementById("refresh");

const statusText =
    document.getElementById("status");

const thumbnailList =
    document.getElementById("thumbnailList");

const editModal =
    document.getElementById("editModal");

const editClose =
    document.getElementById("editClose");

const editId =
    document.getElementById("editId");

const editTitle =
    document.getElementById("editTitle");

const editCategory =
    document.getElementById("editCategory");

const saveEdit =
    document.getElementById("saveEdit");

const editStatus =
    document.getElementById("editStatus");


/* LOGIN / DASHBOARD */

function showLogin() {
    loginScreen.style.display = "flex";
    adminDashboard.classList.remove("active");
}

function showDashboard() {
    loginScreen.style.display = "none";
    adminDashboard.classList.add("active");
    loadThumbnails();
}


/* SESSION */

async function checkSession() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (session) {
        showDashboard();
    } else {
        showLogin();
    }
}


/* LOGIN */

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    loginButton.disabled = true;
    loginButton.textContent = "SIGNING IN...";
    loginStatus.textContent = "";

    const {
        error
    } = await supabaseClient.auth.signInWithPassword({
        email: emailInput.value.trim(),
        password: passwordInput.value
    });

    if (error) {

        loginStatus.textContent =
            "❌ " + error.message;

        loginButton.disabled = false;
        loginButton.textContent = "SIGN IN";

        return;
    }

    showDashboard();

    loginButton.disabled = false;
    loginButton.textContent = "SIGN IN";
});


/* LOGOUT */

logoutButton.addEventListener("click", async () => {

    await supabaseClient.auth.signOut();

    showLogin();

});


/* PUBLISH */

publishButton.addEventListener("click", async () => {

    const file =
        thumbnailInput.files[0];

    const title =
        titleInput.value.trim();

    const category =
        categoryInput.value;

    if (!file) {
        statusText.textContent =
            "Please select a thumbnail.";
        return;
    }

    if (!title) {
        statusText.textContent =
            "Please enter a title.";
        return;
    }

    publishButton.disabled = true;
    publishButton.textContent = "PUBLISHING...";
    statusText.textContent = "";

    try {

        const fileName =
            `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

        const {
            error: uploadError
        } =
            await supabaseClient.storage
                .from("thumbnails")
                .upload(fileName, file);

        if (uploadError)
            throw uploadError;


        const {
            data: publicUrlData
        } =
            supabaseClient.storage
                .from("thumbnails")
                .getPublicUrl(fileName);

        const imageUrl =
            publicUrlData.publicUrl;


        const {
            error: databaseError
        } =
            await supabaseClient
                .from("thumbnails")
                .insert([{
                    title: title,
                    category: category,
                    image_url: imageUrl
                }]);

        if (databaseError)
            throw databaseError;


        statusText.textContent =
            "✅ Thumbnail published successfully!";

        thumbnailInput.value = "";
        titleInput.value = "";

        categoryInput.value =
            "Finance";

        loadThumbnails();

    } catch (error) {

        console.error(error);

        statusText.textContent =
            "❌ Error: " + error.message;

    }

    publishButton.disabled = false;
    publishButton.textContent =
        "PUBLISH THUMBNAIL";
});


/* LOAD */

async function loadThumbnails() {

    thumbnailList.innerHTML =
        `<p class="loading">
            Loading thumbnails...
        </p>`;

    const {
        data,
        error
    } =
        await supabaseClient
            .from("thumbnails")
            .select("*")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        console.error(error);

        thumbnailList.innerHTML =
            `<p class="error">
                Error loading thumbnails.
            </p>`;

        return;
    }

    if (!data || data.length === 0) {

        thumbnailList.innerHTML =
            `<p class="empty">
                No thumbnails uploaded yet.
            </p>`;

        return;
    }

    thumbnailList.innerHTML = "";

    data.forEach(thumbnail => {

        const card =
            document.createElement("div");

        card.className =
            "thumbnail-item";

        card.innerHTML = `

            <img
                src="${thumbnail.image_url}"
                alt="${thumbnail.title}"
            >

            <div class="thumbnail-info">

                <h3>${thumbnail.title}</h3>

                <p>${thumbnail.category}</p>

            </div>

            <div class="thumbnail-actions">

                <button
                    class="edit-button"
                    data-id="${thumbnail.id}"
                >
                    EDIT
                </button>

                <button
                    class="delete-button"
                    data-id="${thumbnail.id}"
                >
                    DELETE
                </button>

            </div>
        `;

        card
            .querySelector(".edit-button")
            .addEventListener("click", () => {
                openEdit(thumbnail);
            });

        card
            .querySelector(".delete-button")
            .addEventListener("click", () => {
                deleteThumbnail(thumbnail);
            });

        thumbnailList.appendChild(card);

    });
}


/* EDIT */

function openEdit(thumbnail) {

    editId.value =
        thumbnail.id;

    editTitle.value =
        thumbnail.title;

    editCategory.value =
        thumbnail.category;

    editStatus.textContent = "";

    editModal.classList.add("active");
}


editClose.addEventListener("click", () => {

    editModal.classList.remove("active");

});


editModal.addEventListener("click", (e) => {

    if (e.target === editModal) {
        editModal.classList.remove("active");
    }

});


/* SAVE EDIT */

saveEdit.addEventListener("click", async () => {

    const id =
        editId.value;

    const title =
        editTitle.value.trim();

    const category =
        editCategory.value;

    if (!title) {

        editStatus.textContent =
            "Please enter a title.";

        return;
    }

    saveEdit.disabled = true;
    saveEdit.textContent = "SAVING...";

    const {
        error
    } =
        await supabaseClient
            .from("thumbnails")
            .update({
                title: title,
                category: category
            })
            .eq("id", id);

    if (error) {

        console.error(error);

        editStatus.textContent =
            "❌ " + error.message;

    } else {

        editStatus.textContent =
            "✅ Updated successfully.";

        setTimeout(() => {

            editModal.classList.remove("active");

            loadThumbnails();

        }, 500);

    }

    saveEdit.disabled = false;
    saveEdit.textContent = "SAVE CHANGES";
});


/* DELETE */

async function deleteThumbnail(thumbnail) {

    const confirmed =
        confirm(
            `Delete "${thumbnail.title}" permanently?`
        );

    if (!confirmed)
        return;


    try {

        /*
         * Extract storage file path
         * from the existing public URL.
         */

        const marker =
            "/storage/v1/object/public/thumbnails/";

        let filePath = null;

        if (thumbnail.image_url.includes(marker)) {

            filePath =
                decodeURIComponent(
                    thumbnail.image_url.split(marker)[1]
                );
        }


        /* DELETE DATABASE ROW */

        const {
            error: databaseError
        } =
            await supabaseClient
                .from("thumbnails")
                .delete()
                .eq("id", thumbnail.id);

        if (databaseError)
            throw databaseError;


        /* DELETE STORAGE FILE */

        if (filePath) {

            const {
                error: storageError
            } =
                await supabaseClient.storage
                    .from("thumbnails")
                    .remove([filePath]);

            if (storageError)
                console.error(
                    "Storage delete error:",
                    storageError
                );
        }


        loadThumbnails();

    } catch (error) {

        console.error(error);

        alert(
            "Delete failed: " +
            error.message
        );
    }
}


/* REFRESH */

refreshButton.addEventListener(
    "click",
    loadThumbnails
);


/* AUTH LISTENER */

supabaseClient.auth.onAuthStateChange(
    (event, session) => {

        if (session) {
            showDashboard();
        } else {
            showLogin();
        }

    }
);


/* START */

checkSession();