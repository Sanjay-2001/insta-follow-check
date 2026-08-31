const followersInput = document.getElementById("followersFile");
const followingInput = document.getElementById("followingFile");
const checkBtn = document.getElementById("checkBtn");

const resultsDiv = document.getElementById("results");
const statsDiv = document.getElementById("stats");


// ------------------------------------
// Read JSON file
// ------------------------------------
function readJSON(file) {
    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result);
                resolve(data);
            } catch (error) {
                reject("Invalid JSON file");
            }
        };

        reader.onerror = () => {
            reject("Could not read file");
        };

        reader.readAsText(file);
    });
}


// ------------------------------------
// Extract Followers
// Followers JSON:
//
// [
//   {
//     "title": "",
//     "string_list_data": [
//       {
//         "value": "username"
//       }
//     ]
//   }
// ]
// ------------------------------------
function extractFollowers(data) {

    const followers = [];

    if (!Array.isArray(data)) {
        return followers;
    }

    data.forEach(item => {

        if (
            item &&
            Array.isArray(item.string_list_data)
        ) {

            item.string_list_data.forEach(entry => {

                if (
                    entry &&
                    typeof entry.value === "string" &&
                    entry.value.trim() !== ""
                ) {
                    followers.push(entry.value.trim());
                }

            });
        }

    });

    return [...new Set(followers)];
}


// ------------------------------------
// Extract Following
//
// {
//   "relationships_following": [
//     {
//       "title": "username",
//       "string_list_data": [
//         {
//           "href": "...",
//           "timestamp": 123
//         }
//       ]
//     }
//   ]
// }
// ------------------------------------
function extractFollowing(data) {

    const following = [];

    // Instagram normally stores following here
    if (
        data &&
        Array.isArray(data.relationships_following)
    ) {

        data.relationships_following.forEach(item => {

            if (
                item &&
                typeof item.title === "string" &&
                item.title.trim() !== ""
            ) {

                following.push(item.title.trim());

            }

        });

    }

    return [...new Set(following)];
}


// ------------------------------------
// Compare Followers vs Following
// ------------------------------------
function findNotFollowingBack(followers, following) {

    // Make a lowercase Set for fast comparison
    const followersSet = new Set(
        followers.map(username =>
            username.toLowerCase()
        )
    );

    return following.filter(username => {

        return !followersSet.has(
            username.toLowerCase()
        );

    });
}


// ------------------------------------
// Display results
// ------------------------------------
function displayResults(
    followers,
    following,
    notFollowingBack
) {

    statsDiv.innerHTML = `
        <div>
            <strong>Followers:</strong>
            ${followers.length}
        </div>

        <div>
            <strong>Following:</strong>
            ${following.length}
        </div>

        <div>
            <strong>Not following you back:</strong>
            ${notFollowingBack.length}
        </div>
    `;


    resultsDiv.innerHTML = "";


    // Nobody found
    if (notFollowingBack.length === 0) {

        resultsDiv.innerHTML = `
            <div class="empty">
                🎉 Everyone you follow follows you back!
            </div>
        `;

        return;
    }


    // Create list
    notFollowingBack.forEach(username => {

        const div = document.createElement("div");

        div.className = "user";


        const link = document.createElement("a");

        link.href =
            `https://www.instagram.com/${encodeURIComponent(username)}/`;

        link.target = "_blank";

        link.rel = "noopener noreferrer";

        link.textContent = `@${username}`;


        div.appendChild(link);

        resultsDiv.appendChild(div);

    });
}


// ------------------------------------
// Check button
// ------------------------------------
checkBtn.addEventListener("click", async () => {

    const followersFile = followersInput.files[0];
    const followingFile = followingInput.files[0];


    // Check files
    if (!followersFile || !followingFile) {

        alert(
            "Please select both Followers JSON and Following JSON files."
        );

        return;
    }


    try {

        // Read both files
        const followersJSON =
            await readJSON(followersFile);

        const followingJSON =
            await readJSON(followingFile);


        // Extract usernames
        const followers =
            extractFollowers(followersJSON);

        const following =
            extractFollowing(followingJSON);


        // Debug information
        console.log("Followers:", followers);

        console.log("Following:", following);


        // Check if extraction worked
        if (followers.length === 0) {

            alert(
                "No followers were found. " +
                "Please make sure you selected the correct followers JSON file."
            );

            return;
        }


        if (following.length === 0) {

            alert(
                "No following accounts were found. " +
                "Please make sure you selected the correct following JSON file."
            );

            return;
        }


        // Compare
        const notFollowingBack =
            findNotFollowingBack(
                followers,
                following
            );


        // Show results
        displayResults(
            followers,
            following,
            notFollowingBack
        );


    } catch (error) {

        console.error(error);

        alert(
            "Something went wrong while reading the JSON files."
        );

    }

});