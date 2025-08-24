// ==UserScript==
// @name         Elli's Floating Ao3 Comment Box
// @namespace    http://tampermonkey.net/
// @version      2025-08-22 Mobile save
// @description  Floating menu and comment box. Mobile friendly!
// @author       ellidimple
// @match        https://archiveofourown.org/works/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=archiveofourown.org
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @resource     style https://raw.githubusercontent.com/ellidimple/AO3-Sticky-Comment-Box/refs/heads/Initial/style.css
// ==/UserScript==

function floatElement(element, summaryText, edge) {
    const floater = document.createElement("details");
    const summary = document.createElement("summary");
    summary.innerText = summaryText;

    floater.classList.add("floatingMenu", `floating_${edge}`);
    floater.classList.add("javascript");
    floater.append(summary);
    element.classList.add("javascript");
    element.insertAdjacentElement("afterend",floater);
    floater.append(element);

    return floater;
}

function retriveComment(url, workNum) {
    //         get and set existing comment

    const existingComment = GM_getValue(url);
    const commentTextArea = document.getElementById(`comment_content_for_${workNum}`);
    if (existingComment) {
        commentTextArea.value = existingComment;
    }
}

function stickyNavigation() {
    //         sticky the navigation
    const work_navigation = document.querySelector("ul.work.navigation.actions");
    work_navigation.id = "workNavigation";
    floatElement(work_navigation, "📔", "top");
}

function stickyComment() {
    //         sticky the comment box
    const comment = document.getElementById("add_comment_placeholder");
    const bottomFloater = floatElement(comment, "💬", "bottom");
    const feedback = document.getElementById("feedback");
    feedback.insertAdjacentElement("beforebegin", bottomFloater);
}

function createSaveComment() {
    const saveComment = document.createElement("input");
    saveComment.id = "saveComment";
    saveComment.type = "button";
    saveComment.value = "Save for later";
    return saveComment;
}

function createCommentNavigation(url, workNum) {
    //         save the comment
    const commentTextArea = document.getElementById(`comment_content_for_${workNum}`);
    const submitComment = document.getElementById(`comment_submit_for_${workNum}`);
    const submitContainer = submitComment.parentElement;
    const comment_actions = document.createElement("ul");

    comment_actions.classList.add("work", "navigation", "actions");

    const saveComment = createSaveComment();
    ["mouseup","touchend", "touchcancel"].forEach((e) => {
        saveComment.addEventListener(e, function(){
            const commentText = commentTextArea.value;
            if (commentText && commentText.length > 0) {
                GM_setValue(url, commentText);
            }
        });    
    });
    // saveComment.addEventListener("mouseup", function(){GM_setValue(url, commentTextArea.value);});

    [submitComment, saveComment].forEach((input) => {
        const li = document.createElement("li");
        li.append(input);
        comment_actions.append(li);
    });

    submitContainer.append(comment_actions);
}

window.addEventListener('load', function() {
    let url = window.location.toString();
    let pathname = window.location.pathname;

    let workNumMatch = pathname.match(/\/works\/(?:\d+\/chapters\/)?(\d+)?$/);

    if (workNumMatch) {
        const workNum = workNumMatch[1];

        retriveComment(url, workNum);
        stickyNavigation();
        stickyComment();
        createCommentNavigation(url, workNum);
GM_addStyle(GM_getResourceText("style"));
//         GM_addStyle(`
// #saveComment {
//   height: auto;
//   padding: 0.25em 0.75em;
// }

// #workNavigation {
//   float: none;
// }

// .floatingMenu {

//   -webkit-box-sizing: border-box;
//   -moz-box-sizing: border-box;
//   box-sizing: border-box;
//   /*filter: contrast(110%);*/
//   padding: 8px;
//   position: sticky;
//   z-index: 1000;
//   text-align: right;
//   margin: 0;

//   &[open] {
//     border: 1px solid;
//   }
// }

// .floatingMenu::marker {
//   display: none;
// }

// .floatingMenu summary {
//   list-style: none;
//   font-size: 1.5em;
// }

// .floating_top {
//   top: 0;
// }

// .floating_bottom {
//   bottom: 0;
// }

// @media only screen and (orientation: portrait) {
//   .floating_bottom {
//     &[open] {
//       position: fixed;
//       top: 0;
//       left: 0;
//       width: 100%;
//       bottom: initial;
//       z-index: 1001;
//       margin: 0;
//     }
//   }
// }
// `);

    }

}, false);

