/* =========================================
   SUPABASE
========================================= */

const SUPABASE_URL =
    "https://snzuoikhihrgmmweqeao.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_FGMRamhkSCXV0WNzIupCkg_WmMMZTtZ";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


/* =========================================
   ELEMENTS
========================================= */

const row1 =
    document.getElementById("thumbnailRow1");

const row2 =
    document.getElementById("thumbnailRow2");

const filterButtons =
    document.querySelectorAll(".filter");

const cursorGlow =
    document.querySelector(".cursor-glow");


/* LIGHTBOX */

const lightbox =
    document.getElementById("lightbox");

const lightboxImage =
    document.getElementById("lightboxImage");

const lightboxTitle =
    document.getElementById("lightboxTitle");

const lightboxCategory =
    document.getElementById("lightboxCategory");

const lightboxClose =
    document.getElementById("lightboxClose");

const lightboxPrev =
    document.getElementById("lightboxPrev");

const lightboxNext =
    document.getElementById("lightboxNext");


/* =========================================
   DATA
========================================= */

let allThumbnails = [];

let filteredThumbnails = [];

let currentIndex = 0;


/* =========================================
   LOAD THUMBNAILS
========================================= */

async function loadThumbnails() {

    row1.innerHTML =
        `<div class="loading">
            Loading work...
        </div>`;

    row2.innerHTML =
        `<div class="loading">
            Loading work...
        </div>`;


    const { data, error } =
        await supabaseClient
            .from("thumbnails")
            .select(
                "id, title, category, image_url, created_at"
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "SUPABASE ERROR:",
            error
        );

        row1.innerHTML =
            `<div class="loading">
                Unable to load thumbnails.
            </div>`;

        row2.innerHTML = "";

        return;
    }


    allThumbnails =
        data || [];

    filteredThumbnails =
        [...allThumbnails];


    renderThumbnails(
        filteredThumbnails
    );
}


/* =========================================
   RENDER THUMBNAILS
========================================= */

function renderThumbnails(
    thumbnails
) {

    row1.innerHTML = "";
    row2.innerHTML = "";


    if (!thumbnails.length) {

        row1.innerHTML =
            `<div class="loading">
                No thumbnails found.
            </div>`;

        return;
    }


    /*
       Split into two rows
    */

    let firstRow = [];
    let secondRow = [];


    thumbnails.forEach(
        (thumbnail, index) => {

            if (index % 2 === 0) {

                firstRow.push(
                    thumbnail
                );

            } else {

                secondRow.push(
                    thumbnail
                );

            }

        }
    );


    /*
       Make second row visible
       even with few thumbnails
    */

    if (secondRow.length < 2) {

        secondRow =
            [...thumbnails];

    }


    createCards(
        row1,
        firstRow
    );

    createCards(
        row2,
        secondRow
    );


    /*
       Duplicate cards for
       seamless animation
    */

    duplicateCards(row1);
    duplicateCards(row2);
}


/* =========================================
   CREATE CARD
========================================= */

function createCards(
    container,
    thumbnails
) {

    thumbnails.forEach(
        thumbnail => {

            const card =
                document.createElement("div");

            card.className =
                "thumbnail-card";


            /*
               IMAGE
            */

            const image =
                document.createElement("img");

            image.src =
                thumbnail.image_url;

            image.alt =
                thumbnail.title;

            image.loading =
                "lazy";


            /*
               OVERLAY
            */

            const overlay =
                document.createElement("div");

            overlay.className =
                "thumbnail-overlay";


            const category =
                document.createElement("div");

            category.className =
                "thumbnail-category";

            category.textContent =
                thumbnail.category;


            const title =
                document.createElement("div");

            title.className =
                "thumbnail-title";

            title.textContent =
                thumbnail.title;


            overlay.appendChild(
                category
            );

            overlay.appendChild(
                title
            );


            card.appendChild(
                image
            );

            card.appendChild(
                overlay
            );


            /*
               CLICK → LIGHTBOX
            */

            card.addEventListener(
                "click",
                function () {

                    currentIndex =
                        filteredThumbnails.findIndex(
                            item =>
                                item.id ===
                                thumbnail.id
                        );


                    if (
                        currentIndex < 0
                    ) {

                        currentIndex = 0;

                    }


                    openLightbox();

                }
            );


            /*
               PAUSE MOVEMENT
            */

            card.addEventListener(
                "mouseenter",
                function () {

                    container.style.animationPlayState =
                        "paused";

                }
            );


            card.addEventListener(
                "mouseleave",
                function () {

                    container.style.animationPlayState =
                        "running";

                }
            );


            container.appendChild(
                card
            );

        }
    );
}


/* =========================================
   DUPLICATE CARDS
========================================= */

function duplicateCards(
    container
) {

    const originalCards =
        Array.from(
            container.children
        );


    originalCards.forEach(
        originalCard => {

            const clone =
                originalCard.cloneNode(
                    true
                );


            /*
               Get title from clone
            */

            const titleElement =
                clone.querySelector(
                    ".thumbnail-title"
                );


            const title =
                titleElement
                    ? titleElement.textContent.trim()
                    : "";


            /*
               Find original thumbnail
            */

            const thumbnail =
                filteredThumbnails.find(
                    item =>
                        item.title ===
                        title
                );


            /*
               CLICK → LIGHTBOX
            */

            if (thumbnail) {

                clone.addEventListener(
                    "click",
                    function () {

                        currentIndex =
                            filteredThumbnails.findIndex(
                                item =>
                                    item.id ===
                                    thumbnail.id
                            );


                        if (
                            currentIndex < 0
                        ) {

                            currentIndex = 0;

                        }


                        openLightbox();

                    }
                );

            }


            /*
               PAUSE MOVEMENT
            */

            clone.addEventListener(
                "mouseenter",
                function () {

                    container.style.animationPlayState =
                        "paused";

                }
            );


            clone.addEventListener(
                "mouseleave",
                function () {

                    container.style.animationPlayState =
                        "running";

                }
            );


            container.appendChild(
                clone
            );

        }
    );
}


/* =========================================
   OPEN LIGHTBOX
========================================= */

function openLightbox() {

    if (
        !filteredThumbnails.length
    ) {

        return;

    }


    const thumbnail =
        filteredThumbnails[
            currentIndex
        ];


    if (!thumbnail) {

        return;

    }


    /*
       Set image
    */

    lightboxImage.src =
        thumbnail.image_url;

    lightboxImage.alt =
        thumbnail.title;


    /*
       Set information
    */

    lightboxTitle.textContent =
        thumbnail.title;

    lightboxCategory.textContent =
        thumbnail.category;


    /*
       SHOW LIGHTBOX
    */

    lightbox.classList.add(
        "active"
    );


    /*
       Stop page scrolling
    */

    document.body.style.overflow =
        "hidden";
}


/* =========================================
   CLOSE LIGHTBOX
========================================= */

function closeLightbox() {

    lightbox.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";

}


/* =========================================
   NEXT
========================================= */

function nextThumbnail() {

    if (
        !filteredThumbnails.length
    ) {

        return;

    }


    currentIndex =
        (
            currentIndex + 1
        ) %
        filteredThumbnails.length;


    openLightbox();
}


/* =========================================
   PREVIOUS
========================================= */

function previousThumbnail() {

    if (
        !filteredThumbnails.length
    ) {

        return;

    }


    currentIndex =
        (
            currentIndex -
            1 +
            filteredThumbnails.length
        ) %
        filteredThumbnails.length;


    openLightbox();
}


/* =========================================
   LIGHTBOX BUTTONS
========================================= */

if (lightboxClose) {

    lightboxClose.addEventListener(
        "click",
        closeLightbox
    );

}

if (lightboxNext) {

    lightboxNext.addEventListener(
        "click",
        nextThumbnail
    );

}

if (lightboxPrev) {

    lightboxPrev.addEventListener(
        "click",
        previousThumbnail
    );

}


/* =========================================
   CLICK OUTSIDE LIGHTBOX
========================================= */

if (lightbox) {

    lightbox.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                lightbox
            ) {

                closeLightbox();

            }

        }
    );

}


/* =========================================
   KEYBOARD
========================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            !lightbox ||
            !lightbox.classList.contains(
                "active"
            )
        ) {

            return;

        }


        if (
            event.key ===
            "Escape"
        ) {

            closeLightbox();

        }


        if (
            event.key ===
            "ArrowRight"
        ) {

            nextThumbnail();

        }


        if (
            event.key ===
            "ArrowLeft"
        ) {

            previousThumbnail();

        }

    }
);


/* =========================================
   FILTERS
========================================= */

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                /*
                   Active state
                */

                filterButtons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );

                button.classList.add(
                    "active"
                );


                /*
                   Category
                */

                const category =
                    button.dataset.category;


                if (
                    category === "All"
                ) {

                    filteredThumbnails =
                        [...allThumbnails];

                } else {

                    filteredThumbnails =
                        allThumbnails.filter(
                            thumbnail =>
                                thumbnail.category ===
                                category
                        );

                }


                renderThumbnails(
                    filteredThumbnails
                );

            }
        );

    }
);


/* =========================================
   CURSOR GLOW
========================================= */

document.addEventListener(
    "mousemove",
    function (event) {

        if (!cursorGlow) {
            return;
        }


        cursorGlow.style.left =
            event.clientX + "px";

        cursorGlow.style.top =
            event.clientY + "px";

    }
);


/* =========================================
   START
========================================= */

loadThumbnails();