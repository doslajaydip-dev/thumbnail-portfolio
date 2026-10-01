/* =====================================================
   JAYDIP GFX — PORTFOLIO SCRIPT
   3 ROW VERSION
===================================================== */


/* ================= SUPABASE ================= */

const SUPABASE_URL =
    "https://snzuoikhihrgmmweqeao.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_FGMRamhkSCXV0WNzIupCkg_WmMMZTtZ";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


/* ================= DOM ================= */

const rowOne =
    document.getElementById("portfolioRowOne");

const rowTwo =
    document.getElementById("portfolioRowTwo");

const emptyMessage =
    document.getElementById("portfolioEmpty");

const filters =
    document.querySelectorAll(".filter");

const lightbox =
    document.getElementById("lightbox");

const lightboxImage =
    document.getElementById("lightboxImage");

const lightboxClose =
    document.getElementById("lightboxClose");

const menuButton =
    document.getElementById("menuButton");

const mobileMenu =
    document.getElementById("mobileMenu");


let allThumbnails = [];


/* =====================================================
   CREATE THIRD ROW
===================================================== */

let rowThree =
    document.getElementById("portfolioRowThree");


if (!rowThree && rowTwo) {

    rowThree =
        document.createElement("div");

    rowThree.id =
        "portfolioRowThree";

    rowThree.className =
        rowOne.className;

    rowTwo.parentNode.insertBefore(
        rowThree,
        rowTwo.nextSibling
    );
}


/* ================= LOAD THUMBNAILS ================= */

async function loadThumbnails() {

    try {

        const { data, error } =
            await supabaseClient
                .from("thumbnails")
                .select("*")
                .order("created_at", {
                    ascending: false
                });


        if (error) {

            console.error(
                "Supabase thumbnail error:",
                error
            );

            showEmpty();

            return;
        }


        allThumbnails =
            data || [];


        renderThumbnails(
            allThumbnails
        );

    } catch (error) {

        console.error(
            "Portfolio loading error:",
            error
        );

        showEmpty();
    }
}


/* ================= RENDER ================= */

function renderThumbnails(items) {

    rowOne.innerHTML = "";
    rowTwo.innerHTML = "";

    if (rowThree) {
        rowThree.innerHTML = "";
    }


    if (!items.length) {

        showEmpty();

        return;
    }


    emptyMessage.style.display =
        "none";


    /* ---------------------------------------------
       SPLIT INTO 3 ROWS
    --------------------------------------------- */

    const firstRow = [];
    const secondRow = [];
    const thirdRow = [];


    items.forEach(
        (item, index) => {

            const row =
                index % 3;


            if (row === 0) {

                firstRow.push(item);

            } else if (row === 1) {

                secondRow.push(item);

            } else {

                thirdRow.push(item);

            }

        }
    );


    /* ---------------------------------------------
       KEEP ROWS POPULATED
       WHEN THERE ARE FEW THUMBNAILS
    --------------------------------------------- */

    if (
        secondRow.length === 0 &&
        firstRow.length
    ) {

        secondRow.push(
            ...firstRow
        );
    }


    if (
        thirdRow.length === 0 &&
        firstRow.length
    ) {

        thirdRow.push(
            ...firstRow
        );
    }


    /* ---------------------------------------------
       CREATE CARDS
    --------------------------------------------- */

    createCards(
        rowOne,
        firstRow
    );


    createCards(
        rowTwo,
        secondRow
    );


    if (rowThree) {

        createCards(
            rowThree,
            thirdRow
        );

    }


    /* ---------------------------------------------
       DUPLICATE FOR CONTINUOUS MARQUEE
    --------------------------------------------- */

    duplicateTrack(
        rowOne
    );


    duplicateTrack(
        rowTwo
    );


    if (rowThree) {

        duplicateTrack(
            rowThree
        );

    }
}


/* ================= CREATE CARD ================= */

function createCards(
    container,
    items
) {

    items.forEach(
        item => {

            const card =
                document.createElement("div");


            card.className =
                "thumbnail-card";


            const image =
                document.createElement("img");


            image.src =
                item.image_url;


            image.alt =
                item.title ||
                "Thumbnail design";


            image.loading =
                "lazy";


            const overlay =
                document.createElement("div");


            overlay.className =
                "thumbnail-overlay";


            const info =
                document.createElement("div");


            const title =
                document.createElement("div");


            title.className =
                "thumbnail-title";


            title.textContent =
                item.title ||
                "Thumbnail";


            const category =
                document.createElement("div");


            category.className =
                "thumbnail-category";


            category.textContent =
                item.category ||
                "Design";


            info.appendChild(
                title
            );


            info.appendChild(
                category
            );


            overlay.appendChild(
                info
            );


            card.appendChild(
                image
            );


            card.appendChild(
                overlay
            );


            card.addEventListener(
                "click",
                () => {

                    openLightbox(
                        item.image_url
                    );

                }
            );


            container.appendChild(
                card
            );

        }
    );
}


/* ================= DUPLICATE TRACK ================= */

function duplicateTrack(track) {

    if (!track) return;


    const original =
        Array.from(
            track.children
        );


    original.forEach(
        card => {

            const clone =
                card.cloneNode(true);


            clone.addEventListener(
                "click",
                () => {

                    const img =
                        clone.querySelector(
                            "img"
                        );


                    if (img) {

                        openLightbox(
                            img.src
                        );

                    }

                }
            );


            track.appendChild(
                clone
            );

        }
    );
}


/* ================= EMPTY ================= */

function showEmpty() {

    rowOne.innerHTML = "";
    rowTwo.innerHTML = "";


    if (rowThree) {

        rowThree.innerHTML = "";

    }


    emptyMessage.style.display =
        "block";
}


/* ================= FILTERS ================= */

filters.forEach(
    filter => {

        filter.addEventListener(
            "click",
            () => {

                filters.forEach(
                    button => {

                        button.classList.remove(
                            "active"
                        );

                    }
                );


                filter.classList.add(
                    "active"
                );


                const selected =
                    filter.dataset.filter;


                if (
                    selected === "all"
                ) {

                    renderThumbnails(
                        allThumbnails
                    );

                    return;
                }


                const filtered =
                    allThumbnails.filter(
                        item => {

                            return (
                                item.category &&
                                item.category
                                    .toLowerCase() ===
                                selected
                                    .toLowerCase()
                            );

                        }
                    );


                renderThumbnails(
                    filtered
                );

            }
        );

    }
);


/* ================= LIGHTBOX ================= */

function openLightbox(
    imageUrl
) {

    if (!imageUrl) return;


    lightboxImage.src =
        imageUrl;


    lightbox.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";
}


function closeLightbox() {

    lightbox.classList.remove(
        "show"
    );


    lightboxImage.src =
        "";


    document.body.style.overflow =
        "";
}


if (lightboxClose) {

    lightboxClose.addEventListener(
        "click",
        closeLightbox
    );

}


if (lightbox) {

    lightbox.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                lightbox
            ) {

                closeLightbox();

            }

        }
    );

}


/* ================= ESC KEY ================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeLightbox();

        }

    }
);


/* ================= MOBILE MENU ================= */

if (
    menuButton &&
    mobileMenu
) {

    menuButton.addEventListener(
        "click",
        () => {

            mobileMenu.classList.toggle(
                "show"
            );

        }
    );


    document
        .querySelectorAll(
            ".mobile-menu a"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        mobileMenu.classList.remove(
                            "show"
                        );

                    }
                );

            }
        );

}


/* ================= NAVBAR SCROLL ================= */

window.addEventListener(
    "scroll",
    () => {

        const navbar =
            document.querySelector(
                ".navbar"
            );


        if (!navbar) return;


        if (
            window.scrollY > 30
        ) {

            navbar.style.boxShadow =
                "0 10px 35px rgba(0,0,0,0.06)";

        } else {

            navbar.style.boxShadow =
                "none";

        }

    },
    {
        passive: true
    }
);


/* ================= START ================= */

loadThumbnails();