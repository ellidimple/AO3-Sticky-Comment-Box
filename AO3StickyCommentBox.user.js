// ==UserScript==
// @name         Elli's Floating Ao3 Comment Box
// @namespace    http://tampermonkey.net/
// @version      0.3
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

function stickyElement(element, summaryText, edge) {
    const sticky = document.createElement("details");
    const summary = document.createElement("summary");
    summary.innerText = summaryText;

    sticky.classList.add("stickyMenu", `sticky_${edge}`, "javascript");
    sticky.append(summary);
    // element.classList.add("javascript");
    element.insertAdjacentElement("afterend",sticky);
    sticky.append(element);

    return sticky;
}

function retrieveComment(pathname, workNum) {
    const savedComments = JSON.parse(GM_getValue("comments", "{}"));
    const existingComment = savedComments[pathname];
    if (existingComment) {
        const commentText = existingComment.text;
        const commentTextArea = document.getElementById(`comment_content_for_${workNum}`);
        commentTextArea.value = commentText;
    }
}

function recycleComment(pathname, workNum) {
    const savedComments = JSON.parse(GM_getValue("comments", "{}"));
    const existingComment = savedComments[pathname];
    const recycledComments = JSON.parse(GM_getValue("recycleBin", "{}"));

    recycledComments[pathname] = existingComment;
    GM_setValue("recycleBin", JSON.stringify(recycledComments));

    delete savedComments[pathname];
    GM_setValue("comments", JSON.stringify(savedComments));
}

function stickyNavigation() {
    //         sticky the navigation
    const workNavigation = document.querySelector("ul.work.navigation.actions");
    workNavigation.id = "workNavigation";
    stickyElement(workNavigation, "📔", "top");
}

function stickyComment() {
    const comment = document.getElementById("add_comment_placeholder");
    const sticky = stickyElement(comment, "💬", "bottom");
    const feedback = document.getElementById("feedback");
    feedback.insertAdjacentElement("beforebegin", sticky);
}

// function createSaveComment() {
//     const saveComment = document.createElement("input");
//     saveComment.id = "saveComment";
//     saveComment.type = "button";
//     saveComment.value = "Save for later";
//     return saveComment;
// }

function createElement(type, attributes) {
    const element = document.createElement(type);
    attributes.forEach(function ([name, value]) {
        element.setAttribute(name, value);
    });
    return element;
}

function createCommentNavigation(pathname, workNum) {
    const submitComment = document.getElementById(`comment_submit_for_${workNum}`);
    const submitContainer = submitComment.parentElement;
    const commentActions = document.createElement("ul");

    commentActions.classList.add("work", "navigation", "actions");

    // const saveComment = createSaveComment();
    const saveComment = createElement("input", [
        ["id", "saveComment"],
        ["type", "button"],
        ["value", "Save for later"]
    ]);

    saveComment.addEventListener("mouseup", function(){
        const commentTextArea = document.getElementById(`comment_content_for_${workNum}`);
        const commentText = commentTextArea.value;

        if (commentText && commentText.length > 0) {
            let savedComments = JSON.parse(GM_getValue("comments", "{}"));
            window.alert(document.title);
            savedComments[pathname] = {
                "title": document.title,
                "text": commentText,
            };
            GM_setValue("comments", JSON.stringify(savedComments));
        }
    });

    [submitComment, saveComment].forEach(function (input) {
        const li = document.createElement("li");
        li.append(input);
        commentActions.append(li);
    });

    submitContainer.append(commentActions);
}

window.addEventListener("load", function() {
    // let url = window.location.toString();
    let pathname = window.location.pathname;

    let workNumMatch = pathname.match(/\/works\/(?:\d+\/chapters\/)?(\d+)?$/);

    if (workNumMatch) {
        const workNum = workNumMatch[1];
        retrieveComment(pathname, workNum);
        stickyNavigation();
        stickyComment();
        createCommentNavigation(pathname, workNum);
        GM_addStyle(GM_getResourceText("style"));
    }

}, false);

